# แก้ pipeline และ parameter ของหน้า Create Job

ขั้นตอนของ pipeline, tool ที่เลือกได้ในแต่ละขั้นตอน และ parameter ของแต่ละ tool ถูกกำหนดไว้ในไฟล์เดียวคือ `src/commons/configs/createJobConfig.ts` หน้า Create Job สร้างฟอร์มจากค่าในไฟล์นี้ทั้งหมด การเพิ่ม tool หรือ parameter ส่วนใหญ่จึงไม่ต้องแก้ component

## ส่วนต่าง ๆ ของไฟล์

| ตัวแปร                   | ใช้ทำอะไร                                                                   |
| ------------------------ | --------------------------------------------------------------------------- |
| `Pipelines`              | ลำดับของขั้นตอน (`method`) และ tool ที่เลือกได้ในแต่ละขั้นตอน (`subMethod`) |
| `defaultPipeline`        | tool ที่ถูกเลือกไว้ตั้งแต่แรกของแต่ละขั้นตอน                                |
| `createJobConfig`        | คำอธิบายและ parameter ของแต่ละ tool เรียงตาม `method` แล้วตาม `subMethod`   |
| `formatInput`            | layout ของฟอร์ม เลือกด้วยเลข `formatInput` ของแต่ละ tool                    |
| `defaultCreateJobDetail` | ค่าเริ่มต้นของ job ใหม่ เช่น protein ตัวอย่าง และ `run_type`                |

โครงของ `createJobConfig` เป็นแบบนี้ (ย่อมาจากของจริง)

```ts
export const createJobConfig: CreateJobConfig = {
  "Protein Query": {
    description: "...",
    tool: {
      MMseqs2: {
        formatInput: 2,
        description: "...",
        parameters: [
          {
            name: "Maximum Sequences",
            id: "max_seqs",
            type: "number",
            description: "...",
            default: 70,
            additionalValidation: { min: { value: 0, message: "..." } },
          },
        ],
      },
    },
  },
};
```

`type` ของ parameter เลือกได้จาก `MethodParameter` ในไฟล์เดียวกัน ได้แก่ `string`, `number`, `percent`, `rangeNumber`, `rangePercent`, `dropdown`, `multiNumberDropdown` และ `boolean` ส่วนเงื่อนไขของค่า เช่นค่าต่ำสุดและข้อความเตือน ให้ใส่ใน `additionalValidation`

## ชื่อ tool ต้องตรงกับ backend

ตอนส่ง job ชื่อ `subMethod` จะถูกแปลงเป็นตัวพิมพ์เล็กแล้วใช้เป็นชื่อ tool ใน `meta` ของ job (ดู `pages/CreateJob/component/CreateJobForm/Conclusion/Conclusion.tsx`) จากนั้น conductor ต่อชื่อ tool กับชื่อ stage เป็น routing key ของ RabbitMQ เช่น `MMseqs2` กลายเป็น `query.mmseqs2` ชื่อที่ตั้งในไฟล์นี้จึงต้องตรงกับ routing key ที่ ML service ใน proteng-kubeflow รอรับอยู่ ถ้าไม่ตรง job จะถูกส่งออกไปแต่ไม่มี service ไหนรับ และค้างอยู่โดยไม่มี error

| ขั้นตอน                | tool ในหน้าเว็บ    | routing key                    |
| ---------------------- | ------------------ | ------------------------------ |
| Protein Query          | `Blast`, `MMseqs2` | `query.blast`, `query.mmseqs2` |
| Protein Representation | `Unirep`           | `evotune.unirep`               |
| Top Model              | `RidgeCV`          | `fittop.ridgecv`               |
| Mutation               | `Mutation`         | `mutation.mutation`            |

`ESM` มีให้เลือกในขั้นตอน Protein Representation แต่ service `evotune_ESM` ยังเป็น proof of concept ที่รอ routing key `evotune.ESM` ซึ่งเป็นตัวพิมพ์ใหญ่ ชื่อที่หน้าเว็บส่งไปจะเป็น `evotune.esm` จึงไม่ตรงกัน และ service นี้ยังไม่ได้รันบนเครื่องที่ใช้งานจริง

## เพิ่ม parameter ให้ tool ที่มีอยู่

1. เพิ่ม object ใน `parameters` ของ tool นั้น โดย `id` ต้องตรงกับชื่อ field ที่ ML service อ่านจาก option ของ job
2. ใส่ `default` และ `additionalValidation` ตามที่ service ยอมรับ
3. รัน `npm run dev` แล้วเปิดหน้า Create Job ดูว่าฟอร์มแสดงถูก จากนั้นสร้าง job หนึ่งงานแล้วดูใน log ของ ML service ว่าได้ค่านั้นจริง

## เพิ่ม tool หรือขั้นตอนใหม่

1. เพิ่มชื่อใน `Pipelines` และถ้าต้องการให้เลือกไว้ตั้งแต่แรก ให้แก้ `defaultPipeline`
2. เพิ่ม tool ใน `createJobConfig` ของขั้นตอนนั้น
3. ฝั่ง backend ต้องมี ML service ที่รอ routing key ตรงกัน ถ้าเป็นขั้นตอนใหม่ ต้องแก้ลำดับ stage ใน proteng-conductor ด้วย ลำดับงานทั้งหมดอยู่ที่ [how-to/add-ml-service.md](https://github.com/ProtEngPlus/manual-guides-2023/blob/main/how-to/add-ml-service.md) ของ hub

## ข้อควรระวัง

- `percent` แสดงเป็นช่องกรอกแบบเปอร์เซ็นต์ ให้ใช้กับ field ที่เป็นเปอร์เซ็นต์จริงเท่านั้น ตอนนี้ E Value ของ MMseqs2 ถูกตั้งเป็น `percent` โดยมีค่า default 70 ซึ่งเป็นบั๊กที่บันทึกไว้เป็น BLB2
- ถ้าเปลี่ยน `id` ของ parameter ที่มีอยู่แล้ว ต้องแก้ฝั่ง ML service ให้อ่านชื่อใหม่ในการเปลี่ยนแปลงชุดเดียวกัน
