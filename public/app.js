const btn = document.getElementById("checkBtn");

const ids = document.getElementById("ids");

ids.addEventListener("input", function () {
    this.value = this.value
        .split("\n")
        .map(line => line.replace(/\s+/g, ""))
        .join("\n");
});

btn.onclick = async () => {

    const device_id = document.getElementById("deviceSelect").value;

    const ids = document
        .getElementById("ids")
        .value
        .split("\n")
        .map(e => e.trim())
        .filter(Boolean);

    if (ids.length == 0) {

        alert("Masukkan ID");

        return;

    }

    btn.disabled = true;

    btn.innerHTML = "Mengecek...";

    const tbody = document.querySelector("#resultTable tbody");

    tbody.innerHTML = "";

    try{

        const response = await fetch("/check",{

            method:"POST",

            headers:{

                "Content-Type":"application/json"

            },

            body:JSON.stringify({

                ids,

		device_id

            })

        });

        const result = await response.json();

        result.data.forEach((trx,index)=>{

            let cls="";

            let status=trx.status;

            switch(String(trx.status)){

                case "1":

                    status="PENDING";

                    cls="pending";

                    break;

                case "6":

                    status="PROCESS";

                    cls="pending";

                    break;

                case "10010005":

                    status="SESSION EXPIRED";

                    cls="expired";

                    break;

                case "9":

                    status="FAILED";

                    cls="failed";

                    break;

                case "5":

                    status="CANCEL";

                    cls="failed";

                    break;

                case "2":

                    status="REFUND";

                    cls="failed";

                    break;

                case "7":

                    status="SUCCESS";

                    cls="success";

                    break;

                case "ERROR":

                    cls="error";

                    break;

                case "NOT FOUND":

                    cls="notfound";

                    break;

            }

            tbody.innerHTML+=`

                <tr>

                    <td>${index+1}</td>

                    <td>${trx.external_id||"-"}</td>

                    <td>${trx.ref_id||"-"}</td>

                    <td class="${cls}">${status}</td>

                </tr>

            `;

        });

    }

    catch(e){

        alert("Gagal request");

    }

    btn.disabled=false;

    btn.innerHTML="CEK STATUS";

}