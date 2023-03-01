import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import styles from './three-screen.module.css'
import vertex from './shader/three-crt/vertex.glsl?raw'
import fragment from './shader/three-crt/fragment.glsl?raw'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import {getSurfacePointFn} from './NurbsSurface'

const SCREEN_WIDTH = 256 * 4;
const SCREEN_HEIGHT = 240 * 4;

const NES_WIDTH = 256;
const NES_HEIGHT = 240;

type RenderRef = {
  render: (image: Uint8ClampedArray) => void;
}

const ThreeScreen = (props: any, ref: React.Ref<unknown> | undefined) => {

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const renderRef = useRef<RenderRef>({render: () => {}})

  const onMount = async () => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current;
    const wgl2 = canvas.getContext('webgl2', { antialias: true });
    if (!wgl2) return;
    const scene = new THREE.Scene();

    const cubeRenderTarget = new THREE.WebGLCubeRenderTarget( 256, {
      format: THREE.RGBFormat,
      generateMipmaps: true,
      minFilter: THREE.LinearMipmapLinearFilter,
      encoding: THREE.sRGBEncoding // temporary -- to prevent the material's shader from recompiling every frame
    } );

    const cubeCamera1 = new THREE.CubeCamera( 1, 1000, cubeRenderTarget );

    const camera = new THREE.PerspectiveCamera( 45, SCREEN_WIDTH / SCREEN_HEIGHT, 0.1, 1000 );

    const renderer = new THREE.WebGLRenderer({ canvas, context: wgl2 });
    // renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );
    const domElem = canvas;
    // domElem.style.width = "100%";
    // domElem.style.height = "auto";
    // setDom(domElem);

    // 设置光照
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 1 );
    scene.add(ambientLight);

    const directionalLight = new THREE.PointLight( 0xFFFFFF, 4, 300, .5 );
    directionalLight.position.set( 25, 100, 50 );
    directionalLight.position.multiplyScalar( 1.3 );
    scene.add(directionalLight);

    camera.position.z = 3;

    const controls = new OrbitControls( camera, domElem );
    controls.maxPolarAngle = Math.PI;
    controls.minDistance = 1;
    controls.maxDistance = 16;

    const dataTexture = new THREE.DataTexture(
      new ImageData(SCREEN_WIDTH, SCREEN_HEIGHT).data, SCREEN_WIDTH, SCREEN_HEIGHT
    );
    dataTexture.flipY = true;
    dataTexture.image = new ImageData(NES_WIDTH, NES_HEIGHT);

    const loader = new GLTFLoader();
    // let tv_material: THREE.MeshStandardMaterial;
    loader.load('/Textures/try/try.gltf', function (gltf: { scene: any }) {
      const model = gltf.scene;
      model.scale.multiplyScalar(7);
      scene.add(model)
      // model.traverse((n) => {
      //   const mesh = n as THREE.Mesh<THREE.Geometry, THREE.MeshStandardMaterial>;
      //   if(mesh.isMesh && !tv_material) {
      //     tv_material = mesh.material;
      //   }
      // })
      // model.traverse((n) => {
      //   const mesh = n as THREE.Mesh<THREE.Geometry, THREE.MeshStandardMaterial>;
      //   if(mesh.isMesh) {
      //     if (mesh.name === 'defaultMaterial_3') {
      //       mesh.scale.multiplyScalar(0);
      //     }
      //   }
      // })
    }, undefined, function ( error: any ) {
      console.error( error );
    });
    /*loader.load('/Textures/old_tv/scene.gltf', function (gltf) {
      const model = gltf.scene
      model.traverse((n) => {
        const mesh = n as THREE.Mesh<THREE.Geometry, THREE.MeshStandardMaterial>;
        if(mesh.isMesh) {
          if (mesh.name === 'defaultMaterial_3') {
            mesh.material.opacity = .2;
            mesh.material.transparent = true;
            scene.add(mesh);
          }
        }
      })
    }, undefined, err => {})*/

    // 图片取值坐标
    const texCoord = new Float32Array([
      0.0,  0.0,
      1.0,  0.0,
      1.0,  1.0,
      1.0,  1.0,
      0.0,  1.0,
      0.0,  0.0
    ]);
    // 贴图顶点坐标
    const vertices = new Float32Array( [
      -1.0, -1.0,  1.0,
      1.0, -1.0,  1.0,
      1.0,  1.0,  1.0,

      1.0,  1.0,  1.0,
      -1.0,  1.0,  1.0,
      -1.0, -1.0,  1.0
    ] );
    // const texture = new THREE.TextureLoader().load('Textures/wallhaven-n61px0.jpg')
    /*const geometry = new THREE.BufferGeometry();
    geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(texCoord, 2));*/
    const getSurfacePoint = await getSurfacePointFn();
    const geometry = new THREE.ParametricBufferGeometry(getSurfacePoint, 16, 16);
    geometry.scale(.64, .50, 1);
    // geometry.scale(.1, .1, .1);
    geometry.translate(-0.19, .1, .75);
    // const geometry = new THREE.BoxGeometry();
    // const material = new THREE.MeshBasicMaterial({ map: dataTexture });
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 1.0 },
        Texture: { value: dataTexture },
      },
      vertexShader: vertex,
      fragmentShader: fragment,
    });
    material.glslVersion = THREE.GLSL3;
    // material.needsUpdate = true;
    const cube = new THREE.Mesh( geometry, material );
    scene.add( cube );
    renderRef.current.render = (data) => {
      dataTexture.image.data.set(data)
      dataTexture.needsUpdate = true;
      renderer.render( scene, camera );
    }
  }

  useEffect(() => {
    onMount()
  }, [canvasRef])

  useImperativeHandle(ref, () => ({
    render(imageData: Uint8ClampedArray) {
      renderRef.current.render(imageData)
    }
  }))

  return (
    <canvas
      className={styles.gl_screen}
      width={SCREEN_WIDTH}
      height={SCREEN_HEIGHT}
      ref={canvasRef}
    />
  )
}

export default forwardRef(ThreeScreen)
