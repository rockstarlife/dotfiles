#!/usr/bin/env fish

mkdir -p ~/Pictures/Screenshots/(date +%Y-%m)
grimblast copysave output ~/Pictures/Screenshots/(date +%Y-%m)/(date +%Y-%m-%d_%H-%M).jpg
