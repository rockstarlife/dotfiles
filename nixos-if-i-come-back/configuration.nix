# ────────────────────── My Nix Cod -──────────────────────
{ config, lib, pkgs, ... }:

# ────────────────────── imports ──────────────────────
{
  imports =
    [ # Include the results of the hardware scan.
      ./hardware-configuration.nix
    ];

boot.loader = {
	efi.canTouchEfiVariables = false;
	systemd-boot.enable = true;
};

# ────────────────────── linux zen karnel ──────────────────────
boot.kernelPackages = pkgs.linuxPackages_zen;

# ────────────────────── zramSwap ──────────────────────
zramSwap.enable = true;
zramSwap.memoryPercent = 50;

# ────────────────────── proprietar packages ──────────────────────
# nixpkgs.config.allowUnfree = true;
nixpkgs.config = {
  allowUnfree = true;
};
# ────────────────────── name of pc ──────────────────────
networking.hostName = "nixmac";

# ────────────────────── time zone ──────────────────────
time.timeZone = "Europe/Moscow";
i18n.defaultLocale = "en_US.UTF-8";

# ────────────────────── user info ──────────────────────
users.users.neo = {
	isNormalUser = true;
  extraGroups = [ "wheel" "video" "input" ];
};

# ────────────────────── nix sttings ──────────────────────
nix.settings = {
  experimental-features = [ "nix-command" "flakes" ];
  auto-optimise-store = true;               # ← можно включить, экономит место
  trusted-users = [ "root" "neo" ];         # ← добавь себя, если хочешь доверять neo
};

# ────────────────────── wifi driver for macbook air 13 ──────────────────────
boot.extraModulePackages = with config.boot.kernelPackages; [
  broadcom_sta
];

boot.blacklistedKernelModules = [
  "b43" "b43legacy" "ssb" "bcma" "brcmfmac" "brcmsmac" "brcm80211"
];


nixpkgs.config = {
  permittedInsecurePackages = [
    "broadcom-sta-6.30.223.271-59-6.18.5"   # ← если ошибка, вставь точное имя из неё
  ];
};

# ────────────────────── Packages ──────────────────────
environment.systemPackages = with pkgs; [
	river-classic
	foot
	google-chrome
	wget
  curl
  git
	neovim
	btop
	eww
	nautilus
	fuzzel
	foliate
	imv
	yazi
	telegram-desktop
	yt-dlp
	fastfetch
	cava
	libqalculate
	tty-clock
	pamixer
	playerctl
	brightnessctl
	grim
	bibata-cursors
  swaybg
	networkmanager # nmcli
  bluez          # bluetoothctl + базовые утилиты
  bluez-tools    # дополнительные инструменты (опционально, но полезно)
	starship
  pciutils
  grim
  slurp
  wl-clipboard
  # для того чтобы работало из коробки как в arch linux.
  xdg-desktop-portal-wlr
  xdg-desktop-portal-gtk
  qt6.qtwayland
  upower
  adwaita-icon-theme
  gnome-themes-extra
  hicolor-icon-theme
];


# ────────────────────── nmcli ──────────────────────
networking.networkmanager.enable = true;

# ────────────────────── bluetoothctl ──────────────────────
hardware.bluetooth = {
  enable = true;
  powerOnBoot = true;   # включается при загрузке
};

# ────────────────────── doas ──────────────────────
security.doas.enable = true;
security.doas.extraRules = [{
  users = [ "neo" ];
  keepEnv = true;          # сохраняет $EDITOR, $PATH и т.д.
  persist = true;          # пароль запрашивает один раз за сессию
}];

# ────────────────────── river ──────────────────────
# Включаем river + Wayland-портал
# programs.river.enable = true;
programs.river-classic.enable = true;
# XDG-портал для Wayland (чтобы приложения понимали, что они в river)
  # xdg.portal = {
  #   enable = true;
  #   extraPortals = [ pkgs.xdg-desktop-portal-wlr ];
  # };
# xdg.portal = {
#   enable = true;
#   extraPortals = [ pkgs.xdg-desktop-portal-wlr ];
#   wlr.enable = true;  # ← это важно, часто забывают
# };

# environment.variables = {
#   XDG_CURRENT_DESKTOP = "river";
#   QT_QPA_PLATFORM = "wayland";
#   MOZ_ENABLE_WAYLAND = "1";
# };

xdg.portal = {
  enable = true;
  wlr.enable = true;
  extraPortals = [ pkgs.xdg-desktop-portal-wlr pkgs.xdg-desktop-portal-gtk ];
};

environment.variables = {
  QT_QPA_PLATFORM = "wayland";
  MOZ_ENABLE_WAYLAND = "1";
  XDG_CURRENT_DESKTOP = "river";
};
# ────────────────────── fish shell ──────────────────────
programs.fish.enable = true;
users.defaultUserShell = pkgs.fish;

# ────────────────────── sddm ──────────────────────
 services.xserver.enable = true;
 services.displayManager.sddm.enable = true;
services.displayManager.sddm.wayland.enable = true;

# ────────────────────── fonts ──────────────────────
fonts.packages = with pkgs; [
  nerd-fonts.jetbrains-mono
];

documentation.nixos.enable = false;

# ────────────────────── never change, it can crash all ──────────────────────
system.stateVersion = "25.11";

}
