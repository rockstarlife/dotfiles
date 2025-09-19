#version 320 es
precision mediump float;
in vec2 v_texcoord;
uniform sampler2D tex;
out vec4 FragColor;

void main() {
    vec4 color = texture(tex, v_texcoord);
    float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    FragColor = vec4(vec3(gray), color.a);
}
