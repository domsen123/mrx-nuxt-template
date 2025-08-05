<script lang="ts" setup>
import type z from 'zod'

import { createWaitlistDTO } from '~~/server/contracts/waitlist.contract'

useSeoMeta({
  title: 'One and Only Nuxt Starter Kit',
})

type Schema = z.output<typeof createWaitlistDTO>
const state = ref<Schema>({
  email: '',
})

const toast = useToast()
const yikesHandler: YikesHandler<Schema> = {
  submit: async (event) => {
    await $fetch('/api/waitlist', {
      method: 'POST',
      body: event.data,
    })
  },
  onSuccess: () => {
    toast.add({
      title: 'Success!',
      description: 'Now you are cool as f**k!',
      color: 'success',
    })
    state.value.email = ''
  },
  onError: () => {
    toast.add({
      title: 'Doh!',
      description: 'This Starter-Kit is not as good as claimed',
      color: 'error',
    })
  },
}
</script>

<template>
  <div>
    <UPageHero
      :links="[
        {
          label: 'GIVE IT TO ME!',
          to: 'https://github.com/domsen123/mrx-nuxt-template',
          external: true,
          icon: 'i-simple-icons-github',
          target: '_blank',
        },
      ]"
      :ui="{ root: 'min-h-[calc(100dvh-var(--ui-header-height))] relative z-50', container: 'relative z-50', description: 'max-w-5xl mx-auto' }"
    >
      <template #title>
        <div class="bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 dark:from-primary-300 dark:via-primary-400 dark:to-primary-500 bg-clip-text text-transparent font-bold">
          STOP SPENDING MONEY ON STARTER KITS!
        </div>
      </template>
      <template #description>
        <div>Apparently, we're terrible at capitalism but great at Vue. No $149 for good code, no "limited time offers" on basic functionality, and definitely no gatekeeping behind paywalls. Just solid, community-driven code that doesn't require you to sell a kidney for authentication and a dashboard.</div>
      </template>
      <UForm :schema="createWaitlistDTO" :state="state" class="max-w-lg w-full mx-auto" v-bind="yikes(yikesHandler)">
        <UFormField name="email">
          <UInput v-model="state.email" placeholder="Enter your E-Mail to join the 'I am cool'-list" size="xl" class="w-full" trailing-icon="i-lucide-send" />
        </UFormField>
      </UForm>
      <template #bottom>
        <div class="absolute inset-0 overflow-hidden pointer-events-none">
          <!-- Floating gradient orbs -->
          <div class="gradient-orb gradient-orb-1"></div>
          <div class="gradient-orb gradient-orb-2"></div>
          <div class="gradient-orb gradient-orb-3"></div>
          <div class="gradient-orb gradient-orb-4"></div>
          <div class="gradient-orb gradient-orb-5"></div>
          <div class="rocket"></div>
          <div class="alien"></div>
        </div>
      </template>
    </UPageHero>
  </div>
</template>

<style scoped>
.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(40px);
  opacity: 0.6;
  animation-duration: 20s;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
  animation-direction: alternate;
}

.gradient-orb-1 {
  width: 180px;
  height: 180px;
  background: radial-gradient(circle, rgba(147, 51, 234, 0.4) 0%, rgba(79, 70, 229, 0.2) 50%, transparent 80%);
  top: 5%;
  left: 10%;
  animation-name: float-1;
  filter: blur(30px);
}

.gradient-orb-2 {
  width: 120px;
  height: 120px;
  background: radial-gradient(circle, rgba(236, 72, 153, 0.5) 0%, rgba(168, 85, 247, 0.3) 50%, transparent 80%);
  top: 15%;
  right: 15%;
  animation-name: float-2;
  animation-delay: -5s;
  filter: blur(25px);
}

.gradient-orb-3 {
  width: 80px;
  height: 80px;
  background: radial-gradient(circle, rgba(34, 197, 94, 0.6) 0%, rgba(16, 185, 129, 0.4) 50%, transparent 80%);
  bottom: 20%;
  left: 5%;
  animation-name: float-3;
  animation-delay: -10s;
  filter: blur(20px);
}

.gradient-orb-4 {
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(251, 191, 36, 0.4) 0%, rgba(245, 158, 11, 0.2) 50%, transparent 80%);
  top: 60%;
  left: 70%;
  animation-name: float-4;
  animation-delay: -15s;
  filter: blur(35px);
}

.gradient-orb-5 {
  width: 100px;
  height: 100px;
  background: radial-gradient(circle, rgba(14, 165, 233, 0.7) 0%, rgba(59, 130, 246, 0.4) 50%, transparent 80%);
  bottom: 5%;
  right: 20%;
  animation-name: float-5;
  animation-delay: -8s;
  filter: blur(22px);
}

@keyframes float-1 {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  25% { transform: translate(30px, -20px) rotate(90deg); }
  50% { transform: translate(-20px, 40px) rotate(180deg); }
  75% { transform: translate(40px, 20px) rotate(270deg); }
}

@keyframes float-2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(-40px, 30px) scale(1.1); }
  66% { transform: translate(20px, -40px) scale(0.9); }
}

@keyframes float-3 {
  0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
  50% { transform: translate(-30px, -30px) rotate(180deg) scale(1.2); }
}

@keyframes float-4 {
  0%, 100% { transform: translate(-50%, -50%) rotate(0deg); }
  25% { transform: translate(-30%, -70%) rotate(90deg); }
  50% { transform: translate(-70%, -30%) rotate(180deg); }
  75% { transform: translate(-30%, -30%) rotate(270deg); }
}

@keyframes float-5 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  20% { transform: translate(25px, -15px) scale(1.1); }
  40% { transform: translate(-15px, 25px) scale(0.8); }
  60% { transform: translate(35px, 10px) scale(1.2); }
  80% { transform: translate(-25px, -20px) scale(0.9); }
}

.rocket {
  position: absolute;
  width: 40px;
  height: 60px;
  top: 30%;
  left: -60px;
  animation: rocket-flight 25s linear infinite;
  opacity: 0.7;
}

.rocket::before {
  content: '';
  position: absolute;
  width: 20px;
  height: 40px;
  background: linear-gradient(to bottom, #ef4444 0%, #dc2626 50%, #991b1b 100%);
  border-radius: 10px 10px 0 0;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  box-shadow: 0 0 20px rgba(239, 68, 68, 0.5);
}

.rocket::after {
  content: '';
  position: absolute;
  width: 30px;
  height: 20px;
  background: radial-gradient(ellipse, rgba(251, 146, 60, 0.8) 0%, rgba(245, 101, 101, 0.6) 50%, transparent 80%);
  border-radius: 50%;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  filter: blur(8px);
  animation: rocket-flame 0.3s ease-in-out infinite alternate;
}

@keyframes rocket-flight {
  0% {
    left: -60px;
    top: 30%;
    transform: rotate(-15deg);
  }
  25% {
    left: 25%;
    top: 10%;
    transform: rotate(10deg);
  }
  50% {
    left: 50%;
    top: 70%;
    transform: rotate(-5deg);
  }
  75% {
    left: 75%;
    top: 20%;
    transform: rotate(15deg);
  }
  100% {
    left: calc(100% + 60px);
    top: 40%;
    transform: rotate(-10deg);
  }
}

@keyframes rocket-flame {
  0% {
    transform: translateX(-50%) scaleY(1);
    opacity: 0.8;
  }
  100% {
    transform: translateX(-50%) scaleY(1.3);
    opacity: 0.6;
  }
}

.alien {
  position: absolute;
  font-size: 2.5rem;
  top: 15%;
  right: 20%;
  animation: alien-float 18s ease-in-out infinite;
  opacity: 0.8;
}

.alien::before {
  content: '👽';
}

@keyframes alien-float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
    right: 20%;
  }
  25% {
    transform: translateY(-30px) rotate(5deg);
    right: 15%;
  }
  50% {
    transform: translateY(-10px) rotate(-3deg);
    right: 25%;
  }
  75% {
    transform: translateY(-25px) rotate(8deg);
    right: 10%;
  }
}
</style>
