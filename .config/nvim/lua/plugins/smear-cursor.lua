return {
  "sphamba/smear-cursor.nvim",
  event = "VeryLazy", -- Загрузка после старта, для скорости
  opts = {
    cursor_color = "none",
    hide_target_hack = true,
    never_draw_over_target = true,
    legacy_computing_symbols_support = true,
    transparent_bg_fallback_color = "#800080",
    stiffness = 0.6,
    damping = 0.85,
  },
}
