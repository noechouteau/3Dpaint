const fragSky = /* glsl */ `
    uniform vec3 uColor;
    uniform float uTime;
    uniform sampler2D uTexture;
    uniform float uWorld;


    varying vec2 vUv;
    varying vec3 vPosition;
    

    vec3 mod289(vec3 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
    }

    vec2 mod289(vec2 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
    }

    vec3 permute(vec3 x) {
    return mod289(((x*34.0)+10.0)*x);
    }

    float snoise(vec2 v)
    {
    const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                        0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                        -0.577350269189626,  // -1.0 + 2.0 * C.x
                        0.024390243902439); // 1.0 / 41.0
    // First corner
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);

    // Other corners
    vec2 i1;
    //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0
    //i1.y = 1.0 - i1.x;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    // x0 = x0 - 0.0 + 0.0 * C.xx ;
    // x1 = x0 - i1 + 1.0 * C.xx ;
    // x2 = x0 - 1.0 + 2.0 * C.xx ;
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;

    // Permutations
    i = mod289(i); // Avoid truncation effects in permutation
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
            + i.x + vec3(0.0, i1.x, 1.0 ));

    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;

    // Gradients: 41 points uniformly over a line, mapped onto a diamond.
    // The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)

    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;

    // Normalise gradients implicitly by scaling m
    // Approximation of: m *= inversesqrt( a0*a0 + h*h );
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );

    // Compute final noise value at P
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
    }

    const vec3 inkColor = vec3(0.);
    const vec3 paperColor = vec3(1.0);

    const float speed = 0.0275;
    const float shadeContrast = 0.55;

    const float F3 =  0.3333333;
    const float G3 =  0.1666667;

    vec3 random3(vec3 c) {
        float j = 4096.0*sin(dot(c,vec3(17.0, 59.4, 15.0)));
        vec3 r;
        r.z = fract(512.0*j);
        j *= .125;
        r.x = fract(512.0*j);
        j *= .125;
        r.y = fract(512.0*j);
        return r-0.5;
    }

    float simplex3d(vec3 p) {
        vec3 s = floor(p + dot(p, vec3(F3)));
        vec3 x = p - s + dot(s, vec3(G3));
        
        vec3 e = step(vec3(0.0), x - x.yzx);
        vec3 i1 = e*(1.0 - e.zxy);
        vec3 i2 = 1.0 - e.zxy*(1.0 - e);
        
        vec3 x1 = x - i1 + G3;
        vec3 x2 = x - i2 + 2.0*G3;
        vec3 x3 = x - 1.0 + 3.0*G3;
        
        vec4 w, d;
        
        w.x = dot(x, x);
        w.y = dot(x1, x1);
        w.z = dot(x2, x2);
        w.w = dot(x3, x3);
        
        w = max(0.6 - w, 0.0);
        
        d.x = dot(random3(s), x);
        d.y = dot(random3(s + i1), x1);
        d.z = dot(random3(s + i2), x2);
        d.w = dot(random3(s + 1.0), x3);
        
        w *= w;
        w *= w;
        d *= w;
        
        return dot(d, vec4(52.0));
    }

    float fbm(vec3 p)
    {
        float f = 0.0;	
        float frequency = 1.0;
        float amplitude = 0.5;
        for (int i = 0; i < 5; i++)
        {
            f += simplex3d(p * frequency) * amplitude;
            amplitude *= 0.5;
            frequency *= 2.0 + float(i) / 100.0;
        }
        return min(f, 1.0);
    }

    void main() {

        vec2 uv = vUv;
        vec2 coord = uv * 0.5 - 0.5;
        vec4 color = vec4(1.);

        if(uWorld == 0.0){
            float p = snoise(vUv*25.
                + uTime*0.3);
            vec4 newColors = texture( uTexture, uv*8. + p*0.09);
            color = vec4( newColors.xyz, 1.0 );

        } else if (uWorld == 1.0){
            uv.x = 1.0 - abs(1.0 - uv.x * 2.0);
            vec3 p = vec3(uv, uTime * speed);
    
            //Sample a noise function
            float blot = fbm(p * 3.0 + 8.0);
            float shade = fbm(p * 9.0 + 16.0);
            
            //Threshold
            blot = (blot + (sqrt(uv.x) - abs(0.5 - uv.y)));
            blot = smoothstep(0.68, 0.71, blot) * max(1.0 - shade * shadeContrast, 0.0);
            
            //Color
            color = vec4(mix(paperColor, inkColor, blot), 1.0);
            color.rgb *= 1.0 - pow(max(length(coord) - 0.5, 0.0), 5.0);

        } else if (uWorld == 2.0){
            float p = snoise(vUv *25.
                + uTime*0.3);
            vec4 newColors = texture( uTexture, uv + p*0.09);
            color = vec4( newColors.xyz, 1.0 );
        } else {
            float p = snoise(vUv *25.
                + uTime*0.3);
            vec4 newColors = texture( uTexture, uv + p*sin(uTime*0.25)*0.09);
            color = vec4( newColors.xyz, 1.0 );
        }

        gl_FragColor = color;
    }
`
export default fragSky;