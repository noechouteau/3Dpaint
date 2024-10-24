const vertBand = /* glsl */ `

    uniform float uTime;
    uniform float uOffset;

    varying vec3 vPosition;
    varying vec2 vUv;


    void main() {
        vUv = uv;
        vec3 newPosition = position;

        newPosition.y += sin(uv.x * 10. + uTime + uOffset) * 0.1;

        gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition,1.0);
    }
`
export default vertBand;