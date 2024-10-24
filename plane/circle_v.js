const vert2 = /* glsl */ `

    uniform float uTime;

    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec3 worldPosition;
    varying vec2 vUv;


    void main() {
        vPosition = position;
        vNormal = normal;
        worldPosition = position;
        vUv = uv;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`
export default vert2;