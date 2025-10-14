if status is-interactive
    # Commands to run in interactive sessions can go here
end
# oh-my-posh init fish --config /usr/share/oh-my-posh/themes/catppuccin.omp.json | source
# set -U fish_greeting ""

# function fish_mode_prompt
#     set -g fish_bind_mode $fish_bind_mode
# end

starship init fish | source
