<template>
  <div class="h-screen flex items-center justify-center px-4 relative overflow-hidden">
    <div class="absolute inset-0 z-0">
      <div class="gradient-blob blob1"></div>
      <div class="gradient-blob blob2"></div>
    </div>

    <UPageCard
      variant="subtle"
      class="max-w-sm w-full"
    >
      <slot />
    </UPageCard>
  </div>
</template>

<style scoped>
.gradient-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.3;
}

.blob1 {
  width: 400px;
  height: 400px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  top: -20%;
  left: -10%;
  animation: wobble1 10s ease-in-out infinite;
}

.blob2 {
  width: 350px;
  height: 350px;
  background: linear-gradient(45deg, #4facfe, #00f2fe);
  bottom: -20%;
  right: -10%;
  animation: wobble2 12s ease-in-out infinite;
}

@keyframes wobble1 {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  25% {
    transform: translate(20px, -30px) scale(1.1);
  }
  50% {
    transform: translate(-15px, 25px) scale(0.9);
  }
  75% {
    transform: translate(25px, 10px) scale(1.05);
  }
}

@keyframes wobble2 {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(-25px, 20px) scale(1.1);
  }
  66% {
    transform: translate(30px, -15px) scale(0.95);
  }
}
</style>
