import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwind from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
export default defineConfig({plugins:[react(),tailwind(),VitePWA({registerType:'autoUpdate',
 manifest:{name:'GoalPulse',short_name:'GoalPulse',start_url:'/',display:'standalone',background_color:'#0b1220',theme_color:'#0b1220',
 icons:[{src:'/icon-192.png',sizes:'192x192',type:'image/png'},{src:'/icon-512.png',sizes:'512x512',type:'image/png',purpose:'any maskable'}]},
 workbox:{navigateFallback:'/index.html',runtimeCaching:[]}})]})
