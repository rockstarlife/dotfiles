if status is-interactive
    # Commands to run in interactive sessions can go here
end
# oh-my-posh init fish --config /usr/share/oh-my-posh/themes/catppuccin.omp.json | source
# set -U fish_greeting ""

# function fish_mode_prompt
#     set -g fish_bind_mode $fish_bind_mode
# end

starship init fish | source

# Ghostty shell integration для Fish — чтоб nvim не путался в промптах
if set -q GHOSTTY_RESOURCES_DIR
    source "$GHOSTTY_RESOURCES_DIR/shell-integration/fish/vendor_conf.d/ghostty-shell-integration.fish"
end

function fish_user_key_bindings
    fish_vi_key_bindings
end
