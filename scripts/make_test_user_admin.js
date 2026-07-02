const fetch = globalThis.fetch || require('node-fetch');
const API_KEY = 'AIzaSyAn5QFh6RjOxXeFplA6MRejmWHyHlll87c';
const projectId = 'the-glorious-church';
const email = 'auto.test1@theglorious-church.test';
const password = 'Test1234';
const docPath = 'projects/the-glorious-church/databases/(default)/documents/staff/lYul9rqiKdJsB2AvZulv';

async function main(){
  try{
    const signInRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true })
    });
    const signInText = await signInRes.text();
    const signInBody = JSON.parse(signInText);
    if(!signInBody.idToken){
      console.error('Sign in failed:', signInBody);
      process.exit(1);
    }
    const idToken = signInBody.idToken;
    const patchBody = {
      fields: {
        name: { stringValue: 'Auto Test User' },
        email: { stringValue: email },
        role: { stringValue: 'Admin' }
      }
    };
    const patchRes = await fetch(`https://firestore.googleapis.com/v1/${docPath}?currentDocument.exists=true`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + idToken
      },
      body: JSON.stringify(patchBody)
    });
    const patchText = await patchRes.text();
    console.log('PATCH_RESULT', patchText);
  } catch(err){
    console.error('ERROR', err);
    process.exit(1);
  }
}

main();
