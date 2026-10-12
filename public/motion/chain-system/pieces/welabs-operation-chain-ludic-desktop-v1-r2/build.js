// LINHA DO TEMPO DA MESMA SOLICITAÇÃO
// Source-grounded objects retain their identity through the editorial reconstruction.
window.__timelines = window.__timelines || {};
document.fonts.ready.then(function () {
// Resolve the travel endpoints once in the authored root coordinate space after font layout settles.
var tokenBox = document.querySelector("#transport-token").getBoundingClientRect();
var orderBox = document.querySelector("#order-task").getBoundingClientRect();
var managerBox = document.querySelector("#manager-task").getBoundingClientRect();
var routeOriginX = orderBox.left + orderBox.width / 2 - tokenBox.left - tokenBox.width / 2;
var routeTargetX = managerBox.left + managerBox.width / 2 - tokenBox.left - tokenBox.width / 2;
var nativeTokens = getComputedStyle(document.querySelector("#root"));
var actionColor = nativeTokens.getPropertyValue("--wl-primary").trim();
var successColor = nativeTokens.getPropertyValue("--wl-success").trim();
var operationTimeline = gsap.timeline({ paused: true });
operationTimeline.addLabel("arrival", 0);
operationTimeline.fromTo("#request", { opacity: 0, x: 28, force3D: false }, { opacity: 1, x: 0, force3D: false, duration: 0.5, ease: "power2.out" }, 0.25);
operationTimeline.addLabel("context", 3.8);
operationTimeline.to("#arrival-panel", { opacity: 0, y: -18, force3D: false, duration: 0.28, ease: "power2.in" }, 3.8);
operationTimeline.fromTo("#context-panel", { opacity: 0, y: 24, force3D: false }, { opacity: 1, y: 0, force3D: false, duration: 0.55, ease: "power2.out" }, 3.95);
operationTimeline.fromTo(".context-object", { opacity: 0, x: 18, force3D: false }, { opacity: 1, x: 0, force3D: false, stagger: 0.13, duration: 0.35, ease: "power2.out" }, 4.05);
operationTimeline.set("#focus-tuner", { opacity: 1 }, 0);
operationTimeline.to("#focus-tuner", { opacity: 0, duration: 0.25 }, 3.8);
operationTimeline.to("#focus-relloo,#focus-domus", { opacity: 1, duration: 0.25 }, 4.05);
operationTimeline.addLabel("knowledge", 8.5);
operationTimeline.to("#context-panel", { opacity: 0, y: -18, force3D: false, duration: 0.25, ease: "power2.in" }, 8.5);
operationTimeline.fromTo("#knowledge-panel", { opacity: 0, y: 24, force3D: false }, { opacity: 1, y: 0, force3D: false, duration: 0.45, ease: "power2.out" }, 8.7);
operationTimeline.fromTo("#policy-excerpt", { opacity: 0, x: 18, force3D: false }, { opacity: 1, x: 0, force3D: false, duration: 0.4, ease: "power2.out" }, 9.05);
operationTimeline.to("#focus-relloo,#focus-domus", { opacity: 0, duration: 0.25 }, 8.5);
operationTimeline.to("#focus-knowly", { opacity: 1, duration: 0.25 }, 8.7);

operationTimeline.fromTo("#reply", { opacity: 0, x: -24, force3D: false }, { opacity: 1, x: 0, force3D: false, duration: 0.45, ease: "power2.out" }, 9.75);
operationTimeline.addLabel("execution", 13.3);
operationTimeline.to("#knowledge-panel", { opacity: 0, y: -18, force3D: false, duration: 0.25, ease: "power2.in" }, 13.3);
operationTimeline.fromTo("#execution-panel", { opacity: 0, y: 24, force3D: false }, { opacity: 1, y: 0, force3D: false, duration: 0.5, ease: "power2.out" }, 13.5);
operationTimeline.to("#focus-knowly", { opacity: 0, duration: 0.25 }, 13.3);
operationTimeline.to("#focus-domus", { opacity: 1, duration: 0.25 }, 13.5);
operationTimeline.to("#order-task", { borderColor: actionColor, duration: 0.25 }, 14.1);
operationTimeline.to("#focus-magneto", { opacity: 1, duration: 0.25 }, 14.7);
operationTimeline.fromTo("#transport-token", { opacity: 0, x: routeOriginX, force3D: false }, { opacity: 1, x: routeOriginX, force3D: false, duration: 0.2 }, 14.85);
operationTimeline.to("#transport-token", { x: routeTargetX, force3D: false, duration: 1.0, ease: "power2.inOut" }, 15.05);
operationTimeline.to("#transport-token", { opacity: 0, duration: 0.2 }, 16.05);
operationTimeline.to("#manager-task", { borderColor: actionColor, duration: 0.25 }, 16.05);
operationTimeline.addLabel("return", 18.9);
operationTimeline.to("#manager-waiting", { opacity: 0, duration: 0.15 }, 18.9);
operationTimeline.to("#manager-approved", { opacity: 1, duration: 0.2 }, 19.05);
operationTimeline.to("#manager-task", { borderColor: successColor, duration: 0.2 }, 19.05);
operationTimeline.to("#transport-token", { opacity: 1, duration: 0.15 }, 19.25);
operationTimeline.to("#transport-token", { x: routeOriginX, force3D: false, duration: 0.8, ease: "power2.inOut" }, 19.4);
operationTimeline.to("#transport-token", { opacity: 0, duration: 0.15 }, 20.2);
operationTimeline.to("#status-waiting", { opacity: 0, duration: 0.1 }, 20.25);
operationTimeline.to("#status-approved", { opacity: 1, duration: 0.1 }, 20.35);
operationTimeline.to("#order-task", { borderColor: successColor, duration: 0.1 }, 20.35);
operationTimeline.to("#focus-magneto", { opacity: 0, duration: 0.2 }, 20.35);
operationTimeline.to("#focus-domus", { opacity: 1, duration: 0.1 }, 20.35);
operationTimeline.fromTo("#time-progress", { scaleX: 0 }, { scaleX: 1, duration: 24, ease: "none" }, 0);
window.__timelines["welabs-operation-chain-ludic-desktop-v1"] = operationTimeline;
});
