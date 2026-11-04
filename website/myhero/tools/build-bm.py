#!/usr/bin/env python3
"""MyHero website: build bm.html, the Bahasa Malaysia page, from index.html (18 Oct 2026).
   python3 tools/build-bm.py      (run from the website folder after any change to index.html)
   One source: index.html stays the page you edit; this swaps every visible string, picture description and the head
   tags for their Malay, flips the EN/BM switch and writes bm.html. A string with no Malay is listed and the build stops,
   so the two pages never drift. The Malay follows the app's own BM words (Rekod, Ubat, Lawatan, Penjaga, Tetapan) and
   needs a read by a native speaker on Dr. Amira's side before launch."""
import io, re, sys, os
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC, OUT = os.path.join(HERE, 'index.html'), os.path.join(HERE, 'bm.html')
s = io.open(SRC, encoding='utf-8').read()

# whole fragments first: the head, headings split by <em>, and the switch
FRAG = [
 ('<html lang="en">', '<html lang="ms">'),
 ('<title>MyHero · Never walk in unsure</title>', '<title>MyHero · Masuk dengan yakin</title>'),
 ('<meta name="description" content="MyHero keeps every report, reading, medicine and visit in one app, explains them in plain language, and turns them into one clear page for your doctor. Built with a doctor, for Malaysia.">',
  '<meta name="description" content="MyHero menyimpan setiap laporan, bacaan, ubat dan lawatan dalam satu aplikasi, menerangkannya dalam bahasa yang mudah, dan menjadikannya satu halaman yang jelas untuk doktor anda. Dibina bersama doktor, untuk Malaysia.">'),
 ('<meta property="og:title" content="MyHero · Never walk in unsure">', '<meta property="og:title" content="MyHero · Masuk dengan yakin"><meta property="og:locale" content="ms_MY">'),
 ('<meta property="og:description" content="Every report, reading and medicine in one app, explained in plain language and ready for your doctor. Built with a doctor in Malaysia.">',
  '<meta property="og:description" content="Setiap laporan, bacaan dan ubat dalam satu aplikasi, diterangkan dalam bahasa yang mudah dan sedia untuk doktor anda. Dibina bersama doktor di Malaysia.">'),
 ('<a class="btn p sm" href="#join">Get early access</a>', '<a class="btn p sm" href="#join">Akses awal</a>'),
 ('<h1 data-r>Never walk in <em>unsure.</em></h1>', '<h1 data-r>Masuk <em>dengan yakin.</em></h1>'),
 ('<h2 data-r>From a plastic bag <em>to one page.</em></h2>', '<h2 data-r>Daripada beg plastik <em>kepada satu halaman.</em></h2>'),
 ('<h2 data-r>See how <em>it works.</em></h2>', '<h2 data-r>Lihat <em>cara ia berfungsi.</em></h2>'),
 ('<h2 data-r>Everything about your health, <em>explained.</em></h2>', '<h2 data-r>Semua tentang kesihatan anda, <em>diterangkan.</em></h2>'),
 ('<h2 data-r>Why a doctor <em>built this.</em></h2>', '<h2 data-r>Kenapa seorang doktor <em>membinanya.</em></h2>'),
 ('<h2 data-r>Made for the clinic, <em>too.</em></h2>', '<h2 data-r>Dibuat untuk klinik <em>juga.</em></h2>'),
 ('<h2 data-r>Your record, <em>your rules.</em></h2>', '<h2 data-r>Rekod anda, <em>peraturan anda.</em></h2>'),
 ('<h2 data-r>Questions, <em>answered.</em></h2>', '<h2 data-r>Soalan, <em>dijawab.</em></h2>'),
 ('<span class="flag uk cur"><svg viewBox="0 0 22 15" aria-hidden="true"><rect width="22" height="15" fill="#1D3F8F"/><path d="M0 0l22 15M22 0L0 15" stroke="#fff" stroke-width="3"/><path d="M0 0l22 15M22 0L0 15" stroke="#D0243C" stroke-width="1.2"/><path d="M11 0v15M0 7.5h22" stroke="#fff" stroke-width="5"/><path d="M11 0v15M0 7.5h22" stroke="#D0243C" stroke-width="3"/></svg></span><span class="lc">EN</span>', '<span class="flag my cur"><svg viewBox="0 0 22 15" aria-hidden="true"><rect width="22" height="15" fill="#fff"/><path d="M0 .54h22M0 2.68h22M0 4.82h22M0 6.96h22M0 9.1h22M0 11.25h22M0 13.39h22" stroke="#D0243C" stroke-width="1.07"/><rect width="11" height="8.04" fill="#1D3F8F"/><circle cx="4.6" cy="4" r="2.6" fill="#F6C945"/><circle cx="5.5" cy="4" r="2.2" fill="#1D3F8F"/><path d="M8.3 2.4l.5 1.1 1.2.1-.9.8.3 1.2-1.1-.6-1.1.6.3-1.2-.9-.8 1.2-.1z" fill="#F6C945"/></svg></span><span class="lc">BM</span>'),
 ('<a role="menuitem" href="index.html" class="on" hreflang="en" lang="en" aria-current="true">', '<a role="menuitem" href="index.html" hreflang="en" lang="en">'),
 ('<a role="menuitem" href="bm.html" hreflang="ms" lang="ms">', '<a role="menuitem" href="bm.html" class="on" hreflang="ms" lang="ms" aria-current="true">'),
 ('<b>minutes in the room.</b> MyHero gives them back to the conversation, not the paperwork.', '<b>minit dalam bilik.</b> MyHero mengembalikannya kepada perbualan, bukan kertas kerja.'),
]
# whole text nodes and attribute values
T = {
 'MyHero home':'Laman utama MyHero','Sections':'Bahagian','Language':'Bahasa','Skip to content':'Langkau ke kandungan',
 'How it works':'Cara guna','The app':'Aplikasi','Why a doctor':'Kenapa doktor','For clinics':'Klinik','Privacy':'Privasi','Questions':'Soalan',
 'Get early access':'Dapatkan akses awal','Menu':'Menu',
 'MyHero keeps every report, reading, medicine and visit in one app, explains them in plain language, and turns them into one clear page for your doctor.':'MyHero menyimpan setiap laporan, bacaan, ubat dan lawatan dalam satu aplikasi, menerangkannya dalam bahasa yang mudah, dan menjadikannya satu halaman yang jelas untuk doktor anda.',
 'See how it works':'Lihat cara ia berfungsi','Built with a doctor':'Dibina bersama doktor','English and Bahasa Malaysia':'Bahasa Inggeris dan Bahasa Malaysia','Never sold':'Tidak pernah dijual',
 'Built for long term care':'Untuk penjagaan jangka panjang','Diabetes':'Diabetes','Blood pressure':'Tekanan darah','Cholesterol':'Kolesterol','Daily medicines':'Ubat harian','Regular follow ups':'Susulan berkala',
 'Three steps, and the pile you carry becomes a record your doctor can read in under a minute.':'Tiga langkah, dan timbunan kertas yang anda bawa menjadi rekod yang boleh dibaca doktor anda dalam masa kurang seminit.',
 'Snap it once.':'Ambil gambar sekali.',
 'Point the camera at a lab report, a prescription or a discharge note. MyHero reads the values and shows you each one to check before it saves, then files it where it belongs.':'Halakan kamera pada laporan makmal, preskripsi atau nota discaj. MyHero membaca nilainya dan menunjukkan setiap satu untuk anda semak sebelum disimpan, kemudian memfailkannya di tempat yang betul.',
 'The doctor sending papers into one folder':'Doktor memasukkan kertas ke dalam satu fail',
 'Understand it.':'Fahami.',
 'Every value comes with what it means and whether it is in range. Readings join their trackers, so you can see what changed since the last visit, in words you can follow.':'Setiap nilai disertakan maksudnya dan sama ada ia dalam julat. Bacaan dimasukkan ke dalam penjejaknya, jadi anda boleh lihat apa yang berubah sejak lawatan lepas, dalam kata-kata yang mudah difahami.',
 'The doctor beside a falling reading on a chart':'Doktor di sebelah carta bacaan yang menurun',
 'Hand it over.':'Serahkan.',
 'Profile, medicines, readings and recent visits on one page, shared by link, code or print, and only when you choose.':'Profil, ubat, bacaan dan lawatan terkini dalam satu halaman, dikongsi melalui pautan, kod atau cetakan, dan hanya apabila anda pilih.',
 'The doctor handing one page to another doctor':'Doktor menyerahkan satu halaman kepada doktor lain',
 'Not a folder of scans. A record that reads what you give it, keeps the picture current and tells you what it means.':'Bukan sekadar fail imbasan. Rekod yang membaca apa yang anda berikan, sentiasa dikemas kini dan memberitahu anda maksudnya.',
 'Home: the day at a glance':'Utama: hari anda sepintas lalu','Your day':'Hari anda','Doses, readings and the next visit at a glance.':'Dos, bacaan dan lawatan seterusnya sepintas lalu.',
 'Trackers with ranges':'Penjejak dengan julat','Readings':'Bacaan','Each one joins a line, with the range marked.':'Setiap satu menyambung garisan, dengan julat ditanda.',
 'Medicines with dose times':'Ubat dengan waktu dos','Medicines':'Ubat','Dose times, food rules and a warning before you run out.':'Waktu dos, peraturan makan dan amaran sebelum ubat habis.',
 'The view for the doctor':'Paparan untuk doktor','For the doctor':'Untuk doktor','What changed since last time, ready to hand over.':'Apa yang berubah sejak kali terakhir, sedia untuk diserahkan.',
 'A doctor going through a patient’s papers at a follow up visit':'Seorang doktor menyemak kertas pesakit semasa lawatan susulan','Photo for illustration':'Gambar hiasan',
 'Most of a follow up goes to rebuilding what already happened: which medicine, what dose, which reading, which month. The patient carries that history between clinics, and nobody ever gave them a tool for it.':'Kebanyakan masa rawatan susulan habis untuk mengingat semula apa yang sudah berlaku: ubat apa, dos berapa, bacaan mana, bulan apa. Pesakit membawa sejarah itu dari klinik ke klinik, dan tiada siapa pernah memberi mereka alat untuknya.',
 'Dr. Amira Abdullah':'Dr. Amira Abdullah','Founder of MyHero, practising doctor and clinic owner, Malaysia':'Pengasas MyHero, doktor yang berpraktis dan pemilik klinik, Malaysia',
 'Patients join where care already happens: at the counter, in the waiting room, and from the pharmacy bag they take home.':'Pesakit menyertai di tempat rawatan sudah berlaku: di kaunter, di ruang menunggu, dan dari beg farmasi yang mereka bawa pulang.',
 'The MyHero sign and a join stand at a clinic counter':'Papan tanda MyHero dan stand pendaftaran di kaunter klinik','At the counter':'Di kaunter','A scan to join stand, so the record starts on the first visit.':'Stand imbas untuk sertai, jadi rekod bermula pada lawatan pertama.',
 'A MyHero poster in a waiting room':'Poster MyHero di ruang menunggu','In the waiting room':'Di ruang menunggu','Bring one page, not a plastic bag.':'Bawa satu halaman, bukan beg plastik.',
 'A MyHero sticker on a pharmacy bag':'Pelekat MyHero pada beg farmasi','At the pharmacy':'Di farmasi','Scan the bag, and the medicine is in the record.':'Imbas beg, dan ubat terus masuk ke dalam rekod.',
 'Clinics: join the first group':'Klinik: sertai kumpulan pertama',
 'A health record is the most personal thing you own. The rules are short, and they are the same here and in the app.':'Rekod kesihatan ialah perkara paling peribadi yang anda miliki. Peraturannya ringkas, dan sama di sini dan dalam aplikasi.',
 'Yours, not ours.':'Milik anda, bukan kami.','The record is yours. We do not sell it, and we do not trade it for advertising.':'Rekod ini milik anda. Kami tidak menjualnya, dan kami tidak menukarnya untuk pengiklanan.',
 'Shared only when you say so.':'Dikongsi hanya apabila anda benarkan.','Every share is one you start, to one person, and you can end it at any time.':'Setiap perkongsian dimulakan oleh anda, kepada seorang, dan anda boleh menamatkannya pada bila-bila masa.',
 'Leave with everything.':'Bawa semuanya bersama anda.','Export the whole record as files you can keep, or delete it completely.':'Eksport seluruh rekod sebagai fail untuk disimpan, atau padam sepenuhnya.',
 'Kept under Malaysian law.':'Dilindungi undang-undang Malaysia.','Stored in Malaysia and handled under the Personal Data Protection Act, as a health record should be.':'Disimpan di Malaysia dan diurus di bawah Akta Perlindungan Data Peribadi, sebagaimana sepatutnya rekod kesihatan.',
 'MyHero keeps your record and explains it. It does not diagnose, and it does not replace your doctor.':'MyHero menyimpan rekod anda dan menerangkannya. Ia tidak mendiagnosis, dan ia tidak menggantikan doktor anda.',
 'The things people ask first. Anything else, write to us.':'Perkara yang orang tanya dahulu. Soalan lain, tulis kepada kami.',
 'What does it cost?':'Berapakah kosnya?','Early access is free. Plans are set at launch, and whatever you choose, your record stays yours.':'Akses awal adalah percuma. Pelan ditetapkan semasa pelancaran, dan apa pun pilihan anda, rekod anda tetap milik anda.',
 'Which phones does it work on?':'Telefon apa yang boleh digunakan?','MyHero comes to Android first and to iPhone after, once its App Store listing is approved.':'MyHero hadir di Android dahulu dan di iPhone kemudian, setelah penyenaraiannya di App Store diluluskan.',
 'Is my health record safe?':'Adakah rekod kesihatan saya selamat?','It is stored in Malaysia and handled under the Personal Data Protection Act 2010. It is never sold. You decide who sees it, and you can download or delete everything at any time.':'Ia disimpan di Malaysia dan diurus di bawah Akta Perlindungan Data Peribadi 2010. Ia tidak pernah dijual. Anda yang tentukan siapa boleh melihatnya, dan anda boleh memuat turun atau memadam semuanya pada bila-bila masa.',
 'Can I keep my mother’s or father’s record?':'Bolehkah saya menyimpan rekod ibu atau bapa saya?','Yes. Add a family member as a caregiver and choose what they can see and do. You can change that, or end it, whenever you like.':'Boleh. Tambah ahli keluarga sebagai penjaga dan pilih apa yang mereka boleh lihat dan lakukan. Anda boleh mengubahnya, atau menamatkannya, bila-bila masa anda mahu.',
 'Is it in Bahasa Malaysia?':'Adakah ia dalam Bahasa Malaysia?','Yes. The app works in English and Bahasa Malaysia, and you can switch at any time in Settings.':'Ya. Aplikasi ini berfungsi dalam Bahasa Inggeris dan Bahasa Malaysia, dan anda boleh menukarnya pada bila-bila masa di Tetapan.',
 'Does MyHero give medical advice?':'Adakah MyHero memberi nasihat perubatan?','No. MyHero keeps your record and explains it in plain words. It does not diagnose and it does not replace your doctor. For anything urgent, call your clinic or 999.':'Tidak. MyHero menyimpan rekod anda dan menerangkannya dalam bahasa yang mudah. Ia tidak mendiagnosis dan tidak menggantikan doktor anda. Untuk sebarang kecemasan, hubungi klinik anda atau 999.',
 'My clinic does not use MyHero. Can I still use it?':'Klinik saya tidak menggunakan MyHero. Bolehkah saya masih menggunakannya?','Yes. Photograph the papers you are given and MyHero reads and files them. Clinics can also join, so the record starts at the counter.':'Boleh. Ambil gambar kertas yang diberikan kepada anda dan MyHero akan membaca serta memfailkannya. Klinik juga boleh menyertai, jadi rekod bermula di kaunter.',
 'Be ready for the next appointment.':'Bersedia untuk temu janji seterusnya.',
 'Early access opens with the first group of patients and clinics. Leave an email and we will send the invite when your turn comes.':'Akses awal dibuka untuk kumpulan pertama pesakit dan klinik. Tinggalkan e-mel dan kami akan menghantar jemputan apabila tiba giliran anda.',
 'Email':'E-mel','you@email.com':'anda@emel.com','Request an invite':'Minta jemputan','One email about the invite. Nothing else.':'Satu e-mel tentang jemputan. Tiada yang lain.',
 'Thank you. Your invite is on its way when your turn comes.':'Terima kasih. Jemputan anda akan dihantar apabila tiba giliran anda.',
 'A personal health record for Malaysian patients and the people who care for them. Founded by Dr. Amira Abdullah, Kuala Lumpur.':'Rekod kesihatan peribadi untuk pesakit di Malaysia dan mereka yang menjaga mereka. Diasaskan oleh Dr. Amira Abdullah, Kuala Lumpur.',
 'Kuala Lumpur':'Kuala Lumpur','Company':'Syarikat','Early access':'Akses awal','Contact':'Hubungi','hello@myhero.my':'hello@myhero.my','Back to the top':'Kembali ke atas','Back to top':'Ke atas',
 '© 2026 MyHero. Prototype site, October 2026.':'© 2026 MyHero. Laman prototaip, Oktober 2026.','MyHero keeps and explains your record. It does not diagnose.':'MyHero menyimpan dan menerangkan rekod anda. Ia tidak mendiagnosis.',
 '&copy; 2026 MyHero. Prototype site, October 2026.':'&copy; 2026 MyHero. Laman prototaip, Oktober 2026.',
 'MyHero':'MyHero','EN':'EN','BM':'BM','English':'English','Bahasa Malaysia':'Bahasa Malaysia',
 # 22 Oct 2026: the animated scenes, the numbers band, the clinic form and the form states
 '1 page':'1 halaman','12.9 g/dL':'12.9 g/dL','2.7 mmol/L':'2.7 mmol/L','20:00 · Metformin':'20:00 · Metformin','mmHg':'mmHg','DA':'DA','HbA1c':'HbA1c','LDL':'LDL',
 'A blood pressure tracker drawing its trend':'Penjejak tekanan darah melukis trennya','A lab report being read and filed':'Laporan makmal dibaca dan difailkan',
 'App screens':'Skrin aplikasi','MyHero in numbers':'MyHero dalam angka','One page handed from the phone to the doctor':'Satu halaman diserahkan dari telefon kepada doktor',
 'Anything we should know? (optional)':'Ada apa-apa yang perlu kami tahu? (pilihan)','Clinic name':'Nama klinik','Your name':'Nama anda','Phone or email':'Telefon atau e-mel','Send':'Hantar',
 'Down 10 in 6 weeks':'Turun 10 dalam 6 minggu','Since the visit on 12 Aug':'Sejak lawatan pada 12 Ogos','Elite Care Clinic':'Klinik Elite Care','Elite Care Clinic · 12 Sep':'Klinik Elite Care · 12 Sep',
 'Ends in 24 hours':'Tamat dalam 24 jam','Filed under Lab results':'Difailkan di bawah Keputusan makmal','For any doctor':'Untuk mana-mana doktor',
 'Haemoglobin':'Hemoglobin','Haemoglobin 12.9':'Hemoglobin 12.9','HbA1c 6.8 %':'HbA1c 6.8 %','LDL 2.7':'LDL 2.7','Health summary':'Ringkasan kesihatan','In range':'Dalam julat','Near target':'Hampir sasaran',
 'Last 6 weeks':'6 minggu lepas','Next dose':'Dos seterusnya','Rohana binti Ismail':'Rohana binti Ismail','Shared with Dr. Amira':'Dikongsi dengan Dr. Amira','The page lands here':'Halaman itu mendarat di sini',
 'Join as a clinic':'Sertai sebagai klinik',
 'The first group of clinics gets the counter stand, the poster and a direct line to us. Tell us who you are and we will call back within two working days.':'Kumpulan klinik pertama menerima stand kaunter, poster dan talian terus kepada kami. Beritahu kami siapa anda dan kami akan menghubungi semula dalam masa dua hari bekerja.',
 'Thank you. We will call back within two working days.':'Terima kasih. Kami akan menghubungi semula dalam masa dua hari bekerja.',
 'Preview only: nothing was sent from this page.':'Pratonton sahaja: tiada apa yang dihantar dari halaman ini.',
 'Something went wrong.':'Ada yang tidak kena.','Write to':'Tulis kepada','and we will reply the same day.':'dan kami akan membalas pada hari yang sama.',
 'Write to hello@myhero.my and we will add you by hand.':'Tulis kepada hello@myhero.my dan kami akan menambah anda secara manual.',
 'Leave this empty':'Biarkan kosong',
 'readings tracked, each with a trend':'bacaan dijejak, setiap satu dengan tren','steps from paper to record':'langkah dari kertas ke rekod','languages, English and Bahasa Malaysia':'bahasa, Bahasa Inggeris dan Bahasa Malaysia','page for any doctor':'halaman untuk mana-mana doktor',
 '128/82 · In range':'128/82 · Dalam julat','Shared, one page':'Dikongsi, satu halaman',
 'Join when you register, and the record starts on the first visit.':'Sertai semasa mendaftar, dan rekod bermula pada lawatan pertama.',
 'Photograph the papers you were given while you wait.':'Ambil gambar kertas yang diberikan sementara anda menunggu.',
 'Scan the bag, and the medicine joins your schedule.':'Imbas beg, dan ubat terus masuk ke dalam jadual anda.',
 'A receptionist at a clinic counter helping a patient':'Penyambut tetamu di kaunter klinik membantu pesakit','Patients in a bright clinic waiting room':'Pesakit di ruang menunggu klinik yang terang','A pharmacist handing a paper medicine bag across the counter':'Ahli farmasi menyerahkan beg ubat kertas di kaunter',
 'Download on the':'Muat turun di','App Store':'App Store','Get it on':'Dapatkan di','Google Play':'Google Play',
 'Store links go live on launch day. Until then the invite list is the way in.':'Pautan kedai aplikasi aktif pada hari pelancaran. Sehingga itu, senarai jemputan adalah jalan masuknya.',
 'Store links go live on launch day.':'Pautan kedai aplikasi aktif pada hari pelancaran.','Still have a question?':'Masih ada soalan?','Write to hello@myhero.my, we reply within a day.':'Tulis kepada hello@myhero.my, kami membalas dalam sehari.',
 'Names and readings on this page are examples. Photographs are for illustration. MyHero keeps your record and explains it; it does not diagnose, and it does not replace your doctor.':'Nama dan bacaan di halaman ini adalah contoh. Gambar adalah untuk hiasan. MyHero menyimpan rekod anda dan menerangkannya; ia tidak mendiagnosis, dan tidak menggantikan doktor anda.',
 'From a plastic bag of paper to one page for your doctor, with sound.':'Daripada beg plastik penuh kertas kepada satu halaman untuk doktor anda, dengan suara.','Play the explainer':'Mainkan video penerangan','Play, 1:37':'Main, 1:37','Demo by BrandMethod.co':'Demo oleh BrandMethod.co','See how it works':'Lihat cara ia berfungsi',
 'Pause':'Jeda','Play':'Main','Seek':'Cari','Mute':'Senyapkan','Unmute':'Bunyikan','Full screen':'Skrin penuh','0:00 / 1:01':'0:00 / 1:01',
 'Store links go live on launch day. Early access is open now.':'Pautan kedai aplikasi aktif pada hari pelancaran. Akses awal dibuka sekarang.',
 'Captions':'Sari kata','CC':'CC',
 'The things people ask first.':'Perkara yang orang tanya dahulu.',
}
DONE = set(T.values())
for _a, _b in FRAG:
    for _t in re.findall(r'>([^<>]+)<', '>' + _b + '<'): DONE.add(re.sub(r'\s+', ' ', _t).strip())
for a, b in FRAG:
    if s.count(a) < 1: sys.exit('fragment not found: ' + a[:70])
    s = s.replace(a, b)
head_end = s.index('<header class="hd"'); tail_start = s.index('<script src="assets/web22/icons.js')
body = s[head_end:tail_start]; missing = set()
def tx(m):
    pre, txt, post = m.group(1), m.group(2), m.group(3)
    k = re.sub(r'\s+', ' ', txt).strip()
    if not k or not re.search('[A-Za-z]', k): return m.group(0)
    if k in T: return pre + txt.replace(k, T[k]) if k in txt else pre + T[k] + post[:0]
    missing.add(k); return m.group(0)
# text between tags (skip inline scripts, styles and svg)
parts = re.split(r'(<script\b.*?</script>|<style\b.*?</style>|<svg\b.*?</svg>)', body, flags=re.S)
for i in range(0, len(parts), 2):
    seg = parts[i]
    seg = re.sub(r'(^|>)([^<>]+)(?=<)', lambda m: m.group(1) + (T.get(re.sub(r'\s+',' ',m.group(2)).strip(), None) and m.group(2).replace(re.sub(r'\s+',' ',m.group(2)).strip(), T[re.sub(r'\s+',' ',m.group(2)).strip()]) or (missing.add(re.sub(r'\s+',' ',m.group(2)).strip()) if re.search('[A-Za-z]', m.group(2)) and re.sub(r'\s+',' ',m.group(2)).strip() not in T else None) or m.group(2)), seg)
    def at(m):
        v = m.group(2)
        if v in T: return m.group(1) + T[v] + '"'
        if re.search('[A-Za-z]', v): missing.add('@' + v)
        return m.group(0)
    seg = re.sub(r'((?:alt|aria-label|placeholder|title)=")([^"]+)"', at, seg)
    parts[i] = seg
body = ''.join(parts)
missing = {m for m in missing if m.strip() and m not in DONE and m.lstrip('@') not in DONE}
if missing:
    print('No Malay yet for:'); [print('  ', m) for m in sorted(missing)]; sys.exit(1)
out = s[:head_end] + body + s[tail_start:]
io.open(OUT, 'w', encoding='utf-8').write(out)
print('wrote bm.html', len(out))
