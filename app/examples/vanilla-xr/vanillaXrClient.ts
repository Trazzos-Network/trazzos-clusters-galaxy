/// <reference types="webxr" />

import * as THREE from "three";

type InitOptions = {
  containerId?: string;
};

type InitResult = {
  message: string;
  dispose: () => void;
};

const BUTTON_STYLES = {
  background:
    "linear-gradient(135deg, rgba(28,181,224,0.9) 0%, rgba(28,224,181,0.9) 100%)",
  color: "#0a0f14",
  padding: "12px 20px",
  border: "none",
  borderRadius: "9999px",
  fontSize: "12px",
  fontWeight: "700",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  boxShadow: "0 12px 35px rgba(28, 199, 224, 0.45)",
} satisfies Record<string, string>;

const STATUS_STYLES = {
  position: "absolute",
  bottom: "20px",
  right: "20px",
  color: "#e2faff",
  fontFamily: "monospace",
  fontSize: "12px",
  background: "rgba(0, 30, 40, 0.55)",
  padding: "12px 16px",
  borderRadius: "8px",
  border: "1px solid rgba(126, 237, 255, 0.2)",
  pointerEvents: "none",
  backdropFilter: "blur(12px)",
} satisfies Record<string, string>;

export async function initVanillaXR(
  options: InitOptions = {}
): Promise<InitResult> {
  const { containerId = "xr-root" } = options;
  const containerEl = document.getElementById(containerId);

  if (!(containerEl instanceof HTMLElement)) {
    throw new Error(`No se encontró el contenedor con id "${containerId}".`);
  }
  const container = containerEl;

  container.replaceChildren();

  const statusLabel = document.createElement("div");
  Object.assign(statusLabel.style, STATUS_STYLES);
  statusLabel.textContent = "Verificando soporte XR…";

  const enterButton = document.createElement("button");
  Object.assign(enterButton.style, BUTTON_STYLES);
  enterButton.textContent = "Iniciar experiencia AR";
  enterButton.disabled = true;
  enterButton.style.opacity = "0.5";
  enterButton.style.cursor = "not-allowed";

  const controlsLayer = document.createElement("div");
  controlsLayer.style.position = "absolute";
  controlsLayer.style.top = "20px";
  controlsLayer.style.right = "20px";
  controlsLayer.style.display = "flex";
  controlsLayer.style.flexDirection = "column";
  controlsLayer.style.gap = "12px";
  controlsLayer.style.zIndex = "10";

  controlsLayer.appendChild(enterButton);
  container.appendChild(statusLabel);
  container.appendChild(controlsLayer);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  });
  renderer.xr.enabled = true;
  renderer.setClearColor(0x000000, 0);

  const containerRect = container.getBoundingClientRect();
  renderer.setSize(
    containerRect.width || window.innerWidth,
    containerRect.height || window.innerHeight
  );
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  renderer.domElement.style.objectFit = "cover";

  container.appendChild(renderer.domElement);

  const clock = new THREE.Clock();
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    70,
    (containerRect.width || window.innerWidth) /
      (containerRect.height || window.innerHeight),
    0.01,
    100
  );
  camera.position.set(0, 1.6, 3);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  // @ts-expect-error three.js ambient light typing narrows copy() signature
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(5, 8, 3);
  // @ts-expect-error three.js directional light typing narrows copy() signature
  scene.add(dirLight);

  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.25, 48, 48),
    new THREE.MeshStandardMaterial({
      color: 0x4de2ff,
      emissive: 0x0a2333,
      emissiveIntensity: 0.25,
      roughness: 0.35,
      metalness: 0.6,
    })
  );
  sphere.position.set(0, 1, 0);
  scene.add(sphere);

  const ground = new THREE.Mesh(
    new THREE.SphereGeometry(0.005, 16, 16),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x111111,
      emissiveIntensity: 0.1,
    })
  );
  ground.visible = false;
  scene.add(ground);

  let arSession: XRSession | null = null;

  renderer.setAnimationLoop(() => {
    const elapsed = clock.getElapsedTime();
    sphere.rotation.y = elapsed * 0.6;
    sphere.rotation.x = Math.sin(elapsed * 0.4) * 0.2;
    renderer.render(scene, camera);
  });

  async function ensureArSupport(): Promise<
    { supported: true } | { supported: false; reason: string }
  > {
    if (typeof navigator === "undefined") {
      return { supported: false, reason: "navigator no disponible" };
    }

    if (!("xr" in navigator)) {
      return { supported: false, reason: "navigator.xr no encontrado" };
    }

    const system = navigator.xr as XRSystem;

    if (typeof system.isSessionSupported === "function") {
      try {
        const supported = await system.isSessionSupported("immersive-ar");
        if (supported) {
          return { supported: true };
        }
        return {
          supported: false,
          reason: "immersive-ar no soportado",
        };
      } catch (error) {
        return {
          supported: false,
          reason:
            error instanceof Error ? error.message : "falló isSessionSupported",
        };
      }
    }

    return {
      supported: false,
      reason: "XRSystem isSessionSupported no disponible",
    };
  }

  async function requestArSession(): Promise<XRSession> {
    if (!("xr" in navigator)) {
      throw new Error("navigator.xr no está disponible");
    }

    const system = navigator.xr as XRSystem;
    if (typeof system.requestSession !== "function") {
      throw new Error("XRSystem.requestSession no está disponible");
    }

    return system.requestSession("immersive-ar", {
      requiredFeatures: ["hit-test", "dom-overlay"],
      domOverlay: { root: document.body },
    });
  }

  const supportResult = await ensureArSupport();

  if (supportResult.supported) {
    enterButton.disabled = false;
    enterButton.style.opacity = "1";
    enterButton.style.cursor = "pointer";
    statusLabel.textContent =
      "AR disponible. Pulsa el botón para iniciar (requiere sitio HTTPS).";
  } else {
    statusLabel.textContent = `AR no soportado: ${supportResult.reason}`;
  }

  async function enterAR() {
    try {
      arSession = await requestArSession();
      renderer.xr.setReferenceSpaceType("local");
      await renderer.xr.setSession(arSession);

      statusLabel.textContent =
        "Sesión AR activa. Usa el botón del navegador/dispositivo para salir.";
      enterButton.textContent = "Reiniciar sesión AR";

      const sessionEnded = () => {
        arSession?.removeEventListener("end", sessionEnded);
        arSession = null;
        statusLabel.textContent =
          "Sesión AR finalizada. Puedes reiniciar desde el botón.";
      };

      arSession.addEventListener("end", sessionEnded);
    } catch (error) {
      statusLabel.textContent =
        error instanceof Error ? error.message : "No se pudo iniciar AR.";
    }
  }

  enterButton.addEventListener("click", () => {
    if (arSession) {
      arSession.end().catch(() => {
        statusLabel.textContent = "No se pudo finalizar la sesión AR.";
      });
      return;
    }
    void enterAR();
  });

  function handleResize() {
    const bounds = container.getBoundingClientRect();
    const width = bounds.width || window.innerWidth;
    const height = bounds.height || window.innerHeight;

    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  window.addEventListener("resize", handleResize);

  const dispose = () => {
    renderer.setAnimationLoop(null);
    window.removeEventListener("resize", handleResize);
    enterButton.replaceWith(enterButton.cloneNode(false));
    container.replaceChildren();
    renderer.dispose();
  };

  return {
    message: statusLabel.textContent ?? "",
    dispose,
  };
}
