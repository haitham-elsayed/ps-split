تحديث التطبيق على GitHub (الملفات كلها على نفس المستوى، من غير فولدرات)
1) افتح الـRepository ps-split على github.com
2) Add file ثم Upload files
3) اسحب كل الملفات اللي في الحزمة ما عدا tests.js (ده اختياري): index.html و sw.js و manifest.webmanifest والأيقونات (icon-*.png) وملفات الخطوط (*.woff2) وملفي الترخيص OFL-Tajawal.txt و OFL-Lalezar.txt
4) Commit changes (هتستبدل القديم)
5) افتح التطبيق على الموبايل وفيه نت، وهتظهر رسالة "فيه نسخة جديدة" اضغط تحديث. أول مرة بعد التحديث محتاجة نت عشان الخطوط تتخزّن، وبعدها كله بيشتغل أوفلاين.
6) لو غيّرت الأيقونة وما ظهرتش: امسح التطبيق من الشاشة الرئيسية وثبّته تاني.

الخطوط (Tajawal و Lalezar) جوه الحزمة تحت ترخيص SIL Open Font License، ولازم ملفي الترخيص يفضلوا معاها.
الملف tests.js اختياري (للمطوّرين): node tests.js index.html

لو هتعمل Repository جديد من الأول: Settings ثم Pages ثم Branch = main و Folder = /(root) ثم Save.
