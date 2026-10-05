# protengplus-frontend

protengplus-frontend เป็นหน้าเว็บของ ProtEngPlus เขียนด้วย React, TypeScript และ Vite หน้าเว็บคุยกับ [proteng-bff](https://github.com/ProtEngPlus/proteng-bff) เพียงตัวเดียว ทั้งเรื่อง login, การสร้างและติดตาม job และการดาวน์โหลดผล ภาพรวมของระบบอยู่ที่ [manual-guides-2023](https://github.com/ProtEngPlus/manual-guides-2023/blob/main/reference/architecture.md)

## เริ่มใช้

ถ้ายังไม่เคยตั้งเครื่อง ให้ทำตาม [tutorials/01-local-setup.md](https://github.com/ProtEngPlus/manual-guides-2023/blob/main/tutorials/01-local-setup.md) ของ hub ซึ่งตั้งทุก repo พร้อมกัน ถ้าจะตั้งเฉพาะ repo นี้

```sh
cp -n .env.example .env.local
npm ci
npm run dev
```

- `cp -n` จะไม่ทับ `.env.local` ที่มีอยู่แล้ว
- `npm ci` ลง dependency ตาม `package-lock.json` และติดตั้ง git hook ผ่าน husky ให้เอง
- `npm run dev` ผ่านเมื่อเห็น `Local: http://localhost:5173/` ต้องมี bff รันอยู่ที่ `http://localhost:8080` จึงจะ login และเรียก API ได้

ต้องใช้ Node.js 20 ซึ่งตรงกับ CI

## คำสั่ง

| คำสั่ง                                    | ทำอะไร                                           |
| ----------------------------------------- | ------------------------------------------------ |
| `npm run dev`                             | dev server ที่ <http://localhost:5173>           |
| `npm run format` และ `npm run lint:fix`   | จัด format ด้วย prettier และแก้ด้วย eslint       |
| `npm run format:check` และ `npm run lint` | ตรวจโดยไม่แก้ เหมือนกับ CI                       |
| `npm run build`                           | ตรวจ type ด้วย `tsc -b` แล้ว build ไปที่ `dist/` |
| `npm run preview`                         | เปิดผลของ build ในเครื่อง                        |

ก่อน push ให้รัน `npm run format:check && npm run lint && npm run build` ซึ่งเป็นสิ่งเดียวกับที่ hook ตอน push ตรวจ

## Config

| ตัวแปร                  | ค่าตอนรัน local         | ใช้ทำอะไร                                                                                                      |
| ----------------------- | ----------------------- | -------------------------------------------------------------------------------------------------------------- |
| `VITE_BACKEND_BASE_URL` | `http://localhost:8080` | ที่อยู่ของ bff ถ้าไม่ตั้ง จะใช้ `/api` ซึ่งเป็น path ที่ reverse proxy ของ dev และ production ส่งต่อไปยัง bff  |
| `VITE_ENVIRONMENT`      | `local`                 | ชื่อ environment ค่าที่ใช้คือ `local`, `dev` และ `production` หน้า Sign In แสดงชื่อนี้เมื่อไม่ใช่ `production` |

Vite ฝังค่า `VITE_*` ลงในไฟล์ JavaScript ตอน build และตอนเริ่ม dev server ไม่ได้อ่านตอน runtime ถ้าแก้ค่าแล้วต้องเริ่ม `npm run dev` ใหม่ ส่วน dev และ production ได้ค่าผ่าน `build-args` ของ workflow `build-push.yaml` ตอน build image ค่าเหล่านี้จึงห้ามเป็น secret เพราะใครก็อ่านได้จากไฟล์ที่ browser โหลด

## โครงสร้างโค้ด

| ที่อยู่                                        | มีอะไร                                                                                                                                     |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/pages/<Page>/`                            | หน้าของเว็บ หนึ่งโฟลเดอร์ต่อหนึ่งหน้า เช่น `CreateJob`, `JobDetail` และ `Dashboard` component ที่ใช้แค่ในหน้านั้นอยู่ในโฟลเดอร์ย่อยของหน้า |
| `src/routes/`                                  | route ของทุกหน้า (`router.tsx`)                                                                                                            |
| `src/commons/components/`                      | component ที่ใช้หลายหน้า                                                                                                                   |
| `src/commons/api/`                             | ฟังก์ชันที่เรียก bff แยกตามเรื่อง                                                                                                          |
| `src/commons/configs/`                         | `apiConfig.ts`, `envConfig.ts` และ `createJobConfig.ts` ซึ่งกำหนด pipeline และ parameter ของทุก stage                                      |
| `src/commons/interfaces/`                      | type ของข้อมูลที่รับส่งกับ API                                                                                                             |
| `src/commons/hooks/`, `src/commons/providers/` | `useAuth` และ `AuthProvider`                                                                                                               |

การเพิ่มหรือแก้ stage และ parameter ของ pipeline อยู่ที่ [docs/pipeline-config.md](./docs/pipeline-config.md)

## Deploy

push เข้า `dev` จะ build image และ deploy ขึ้น dev ส่วน push เข้า `main` จะ deploy ขึ้น production ทั้งสองแบบเกิดขึ้นทันทีทุกครั้งที่ push แม้จะแก้แค่ docs วิธีตรวจและ rollback อยู่ที่ [how-to/deploy-app.md](https://github.com/ProtEngPlus/manual-guides-2023/blob/main/how-to/deploy-app.md)

## ลิงก์

- กติกาการทำงานและ hook ของ repo นี้: [CONTRIBUTING.md](./CONTRIBUTING.md)
- API ทั้งหมดอยู่ใน Swagger ของ bff ที่ <http://localhost:8080/swagger/index.html> เมื่อรัน bff ในเครื่อง
- เอกสารของทั้งระบบ: [manual-guides-2023](https://github.com/ProtEngPlus/manual-guides-2023/blob/main/README.md)
