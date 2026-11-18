EDIT CAWIYE BACKEND — NOOCA LA SAXAY

Noocii hore wuxuu video-ga si toos ah ugu diri jiray speech-to-text isagoo video u diraya meel audio laga rabo. Noocan cusub wuxuu FFmpeg uga soo saarayaa codka video-ga, MP3 ayuu ka dhigaa, kadib ayuu u diraa Groq Whisper. Wuxuu soo celiyaa qoraalka iyo timestamps.

GELINTA MOBILKA:
1. Soo dejiso ZIP-kan oo ka fur My Files.
2. GitHub ka samee repository cusub: edit-cawiye-backend.
3. Soo geli faylasha gudaha folder-ka (server.js, package.json, render.yaml, .gitignore). Ha gelin ZIP keliya.
4. Render.com > New > Web Service, ku xiro GitHub repository-ga.
5. Build Command: npm install
6. Start Command: npm start
7. Render > Environment ku dar:
   Key: GROQ_API_KEY
   Value: API key-ga Groq. Sir ha ahaado; ha gelin HTML/GitHub.
8. Deploy sug. Fur https://MAGACA.onrender.com/health; jawaabtu waa inay noqotaa {"ok":true}.
9. Acode ku fur index.html cusub. Sanduuqa API endpoint geli:
   https://MAGACA.onrender.com/api/transcribe
   MAGACA ku beddel magaca adeeggaaga Render.
10. Save/refresh, soo geli video, kadib Samee Captions-ka.

XADAD:
- Video upload ugu badnaan 100 MB.
- Codka la soo saaray ugu badnaan 24 MB.
- Internet iyo GROQ_API_KEY sax ah waa lama huraan.
- Adeegga API wuxuu yeelan karaa xad isticmaal/kharash. Hubi shuruudaha; qof weyn ha kaa caawiyo akoonka iyo API key-ga.
- Saxnaanta Somali waxay ku xiran tahay tayada codka; lama dammaanad qaado 100%.
