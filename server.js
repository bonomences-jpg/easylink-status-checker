require("dotenv").config();

const express = require("express");
const axios = require("axios");
const path = require("path");

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/check", async (req, res) => {

    const { ids, device_id } = req.body;

console.log("Device dari frontend:", device_id);

    if (!ids || ids.length === 0) {
        return res.status(400).json({
            success: false,
            message: "Data kosong"
        });
    }

    // =====================================================
    // ISI ENDPOINT EASYLINK DISINI
    // =====================================================

    const API_URL = "https://api-merchant.easylink.id/merchant-transaction/transaction-list";

    const hasil = [];

    const BATCH_SIZE = 10;

    for (let i = 0; i < ids.length; i += BATCH_SIZE) {

        const batch = ids.slice(i, i + BATCH_SIZE);

        const promises = batch.map(async (id) => {

            try {

console.log("Device dipilih:", device_id);

                const body = {

                    language: "en",

                    device_id: device_id,

                    ref_id: /^\d+$/.test(id) ? id : "",

                    external_id: /^\d+$/.test(id) ? "" : id,

                    page_number: 1,

                    page_size: 100,

                    remittance_type: 2,

                    status_types: "1",

                    status: ""

                };

                const response = await axios.post(

                    API_URL,

                    body,

                    {

                        headers: {

                            Accept: "application/json",

                            "Content-Type": "application/json",

                        }

                    }

                );

console.log("Response EasyLink:");
console.log(JSON.stringify(response.data, null, 2));

if (response.data.code === 10010005) {
    return {
        external_id: body.external_id,
        ref_id: body.ref_id,
        status: "10010005"
    };
}

                const trx = response.data?.data?.list?.[0];

                if (!trx) {

                    return {

                        external_id: body.external_id,

                        ref_id: body.ref_id,

                        status: "NOT FOUND"

                    };

                }

                return {

                    external_id: trx.external_id,

                    ref_id: trx.ref_id,

                    status: trx.status

                };

            } catch (err) {

console.log("===== ERROR =====");
    console.log(err.response?.status);
    console.log(JSON.stringify(err.response?.data, null, 2));

                return {

                    external_id: /^\d+$/.test(id) ? "" : id,

                    ref_id: /^\d+$/.test(id) ? id : "",

                    status: "ERROR"

                };

            }

        });

        const result = await Promise.all(promises);

        hasil.push(...result);

    }

    res.json({

        success: true,

        data: hasil

    });

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log(`Server running on port ${PORT}`);

});