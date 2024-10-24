const frag2 = /* glsl */ `
    uniform vec3 uColor;
    uniform float uTime;
    uniform float uAspectRatio;

    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 worldPosition;
    varying vec2 vUv;

    
    void main() {
        vec2 uv = vUv;

        vec2 center = vec2(0.5);

        float distanceToCenter = distance(center,uv);
        float radius = .15;

        float circle = step(radius, mod(distanceToCenter*6.0 -uTime*0.2, 0.3));

        vec3 color = vec3(smoothstep(circle, circle + 1.2 , sin(uv.x*3.)-0.4));


        gl_FragColor = vec4(color, 1.0);
    }
`
export default frag2;