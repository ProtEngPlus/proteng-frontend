# Contributing

กติกาเรื่อง branch, commit message, PR และ docs ของทุก repo อยู่ที่ [CONTRIBUTING.md ของ hub](https://github.com/ProtEngPlus/manual-guides-2023/blob/main/CONTRIBUTING.md) หน้านี้มีเฉพาะเรื่องของ protengplus-frontend

- repo นี้มี default branch เป็น `dev` แตก branch จาก `dev` และเปิด PR เข้า `dev` push เข้า `dev` จะ deploy ขึ้น dev ทันที และ push เข้า `main` จะ deploy ขึ้น production ทันที
- ก่อน push ให้รัน `npm run format:check && npm run lint && npm run build`
- repo นี้เป็น public และค่า `VITE_*` ถูกฝังลงในไฟล์ที่ browser โหลด ห้ามใส่ credential ทั้งในโค้ดและใน `.env*`

## แก้คู่กับ repo อื่น

ของต่อไปนี้ต้องแก้พร้อมกับอีก repo ในงานชุดเดียวกัน และ PR ของทั้งสองฝั่งต้องใส่ `Related: ProtEngPlus/<repo>#<เลข PR>` ถึงกัน รายการเต็มและลำดับการ merge อยู่ใน [CONTRIBUTING ของ hub](https://github.com/ProtEngPlus/manual-guides-2023/blob/main/CONTRIBUTING.md#ของที่ต้องแก้คู่กันข้าม-repo)

- ชื่อ tool ใน `createJobConfig.ts` (ตัวพิมพ์เล็ก) ต้องตรงกับ routing key ของ ML service ใน proteng-kubeflow
- `id` ของ parameter ต้องตรงกับชื่อ field ที่ ML service อ่าน
- path ของหน้า reset password และยืนยันอีเมลต้องตรงกับลิงก์ที่ user-mgmt ส่งในอีเมล

## hook

`npm ci` ติดตั้ง hook ให้เองผ่าน husky ไม่ต้องใช้ pre-commit

| ตอน                  | hook                                                                                                                                                                |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| commit               | lint-staged รัน `eslint --fix` และ `prettier --write` กับไฟล์ JavaScript และ TypeScript ที่ staged และรัน `prettier --write` กับ JSON, CSS, Markdown, HTML และ YAML |
| push                 | `npm run format:check`, `npm run lint` และ `npm run build`                                                                                                          |
| เขียน commit message | commitlint ปฏิเสธ message ที่ไม่ตรงกับ Conventional Commits                                                                                                         |

ถ้า lint-staged แก้ไฟล์ให้ระหว่าง commit ไฟล์ที่แก้จะถูกรวมเข้า commit ให้เอง ถ้า eslint เจอปัญหาที่แก้เองไม่ได้ commit จะไม่เกิดขึ้น ให้แก้ตามข้อความแล้ว commit ใหม่
