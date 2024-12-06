import * as e from "../src/models/Event.js";
import { DataTypes, Model } from "sequelize";
import sequelize from "../src/config/database.js";
import { createEvent } from "../src/controllers/eventController.js";
import { describe, expect, test } from "@jest/globals";
import * as h from "http2";
import axios from "axios";

// title: "Article1",
// image: "/image",
// desc: "article1",
// date: "2024-01-01",
// export async function test_event() {
//     await e.default.create({
//         title: "Article1",
//         image: "/image",
//         description: "article1",
//         date: new Date("2024-01-01"),
//     });
//     const events = await e.default.findAll();
//     console.log("Événements créés:", JSON.stringify(events, null, 2));
// }

// describe("Event tests", () => {
//     test("createEvent ", () => {
//         await axios.get("http:/localhost/");
//     });

//     test("addSpan", () => {
//         let r = new ReservationService();
//         let sp: sp.InputSpan = {
//             start: new Date(2024, 3, 18, 12, 0),
//             end: new Date(2024, 3, 18, 12, 15),
//             desc: "prog c",
//             title: "c",
//         };
//         let sp2: sp.InputSpan = {
//             start: new Date(2024, 3, 18, 12, 0),
//             end: new Date(2024, 3, 18, 12, 15),
//             desc: "prog c++",
//             title: "c++",
//         };
//         r.addSpan(sp);
//         r.addSpan(sp2);
//         expect(r.spans).toStrictEqual([
//             {
//                 id: 1,
//                 start: new Date(2024, 3, 18, 12, 0),
//                 end: new Date(2024, 3, 18, 12, 15),
//                 desc: "prog c",
//                 title: "c",
//             },
//             {
//                 id: 2,
//                 start: new Date(2024, 3, 18, 12, 0),
//                 end: new Date(2024, 3, 18, 12, 15),
//                 desc: "prog c++",
//                 title: "c++",
//             },
//         ]);
//     });
// });
