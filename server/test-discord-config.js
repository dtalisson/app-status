// Script para testar se as variáveis Discord estão configuradas
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

console.log('\n🔍 Testando configuração Discord OAuth...\n');

const clientId = process.env.DISCORD_CLIENT_ID;
const clientSecret = process.env.DISCORD_CLIENT_SECRET;
const redirectUri = process.env.DISCORD_REDIRECT_URI || 'http://localhost:3000?token=';
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

console.log('📋 Variáveis encontradas:');
console.log('  DISCORD_CLIENT_ID:', clientId ? `✅ ${clientId.substring(0, 10)}...` : '❌ NÃO ENCONTRADO');
console.log('  DISCORD_CLIENT_SECRET:', clientSecret ? '✅ Configurado (oculto)' : '❌ NÃO ENCONTRADO');
console.log('  DISCORD_REDIRECT_URI:', redirectUri);
console.log('  FRONTEND_URL:', frontendUrl);

console.log('\n📊 Status:');

if (clientId && clientSecret) {
  console.log('  ✅ TUDO CONFIGURADO CORRETAMENTE!');
  console.log('  ✅ Você pode reiniciar o servidor agora.');
  console.log('  ✅ O login Discord deve funcionar!');
} else {
  console.log('  ❌ CONFIGURAÇÃO INCOMPLETA!');
  if (!clientId) {
    console.log('  ❌ DISCORD_CLIENT_ID está faltando');
  }
  if (!clientSecret) {
    console.log('  ❌ DISCORD_CLIENT_SECRET está faltando');
  }
  console.log('\n  📝 Verifique o arquivo server/.env');
  console.log('  📖 Veja CONFIGURAR_DISCORD_AGORA.md para instruções');
}

console.log('\n');


