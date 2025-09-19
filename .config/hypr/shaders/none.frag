#version 320 es
precision mediump float;
in vec2 v_texcoord;
uniform sampler2D tex;
out vec4 FragColor;

void main() {
    FragColor = texture(tex, v_texcoord);
}
