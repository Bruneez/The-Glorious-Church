const fetch = globalThis.fetch || require('node-fetch');
const API_KEY = 'AIzaSyAn5QFh6RjOxXeFplA6MRejmWHyHlll87c';
const projectId = 'the-glorious-church';
const email = 'auto.test1@theglorious-church.test';
const password = 'Test1234';

async function main(){
  try{
    // Sign up (or fail if exists)
    let res = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key='+API_KEY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true })
    });
    let out = await res.text();
    let body;
    try{ body = JSON.parse(out); } catch(e){ console.log('SIGNUP_RAW', out); body = { error: { message: 'parseError' } }; }
    console.log('SIGNUP', body);

    if(!body.idToken){
      // Try sign in if sign up didn't return token
      res = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key='+API_KEY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, returnSecureToken: true })
      });
      out = await res.text();
      try{ body = JSON.parse(out); } catch(e){ console.log('SIGNIN_RAW', out); body = { error: { message: 'parseError' } }; }
      console.log('SIGNIN', body);
    }

    if(!body.idToken){
      console.error('No idToken, aborting');
      process.exit(1);
    }

    const idToken = body.idToken;

    // Create staff document
    const docBody = {
      fields: {
        name: { stringValue: 'Auto Test User' },
        email: { stringValue: email },
        role: { stringValue: 'TESTER' }
      }
    };

    res = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/staff`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + idToken },
      body: JSON.stringify(docBody)
    });

    out = await res.text();
    try{ console.log('CREATE_DOC', JSON.parse(out)); } catch(e){ console.log('CREATE_DOC_RAW', out); }

  }catch(err){
    console.error('EX', err);
    process.exit(1);
  }
}

main();
