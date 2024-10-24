export const fragmentShader = `
    varying vec3 vNormal;

    void main() {

        gl_FragColor = vec4(vNormal*0.5+0.5, 1.0);
    }
`;

export const vertexShader = `
    varying vec3 vNormal;

    void main() {
        vNormal = normal;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }
`;