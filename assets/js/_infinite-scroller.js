function deleteRow(id) {
    const row = document.getElementById(id);
    if (row) row.remove();
    restDelete(id);
}

async function infiniteScroll(apiPrefix, modelUrl, fields) {
    const scroller = document.getElementById("infinite-scroller");
    const tableBody = document.getElementById("table-body");
    const spinner = document.getElementById("loading");
    let skip = 0;
    const limit = 10;
    let moreToFetch = true;

    const populateTable = (results) => {
        results.forEach((result) => {
            const tr = document.createElement("tr");
            tr.id = `${apiPrefix}${modelUrl}/${result.id}`;
            tr.innerHTML = "";
            fields.forEach((field ) => { 
                tr.innerHTML += `<td class="text-${field.align}">${result[field.attr]}</td>`;
            });

            tr.innerHTML += `
                <td>
                    <a href="${modelUrl}/${result.id}/edit">
                        <i class="fa fa-edit" style="color: black; cursor: pointer" data-toggle="tooltip" data-placement="right" title="Edit this record"></i>
                    </a>
                </td>`;

            tr.innerHTML += `
                <td>
                    <i class="fa fa-trash-o" onclick="deleteRow('${apiPrefix}${modelUrl}/${result.id}')" style="color: black; cursor: pointer" data-toggle="tooltip" data-placement="right" title="Delete this record"></i>
                </td>`;

            tableBody.appendChild(tr);
        });
    };

    const fetchData = async (skip, limit) => {
        setTimeout(async () => {
            try {              
                const response = await fetch(`${apiPrefix}${modelUrl}?skip=${skip}&limit=${limit}`, {});

                if (!response.ok) {
                    throw new Error(`An error occurred: ${response.status}`);
                }
                
                const results = await response.json();
                populateTable(results);
                moreToFetch = results.length === limit;

                spinner.style.display = "none";
            } catch (error) {
                console.log(error.message);
            }
        }, 500);
    };

    const activateScrollHandler = () => {
        scroller.addEventListener("scroll", onScroll, {
            passive: true,
        })
    };

    const onScroll = async () => {
        const { scrollTop, scrollHeight, clientHeight } = scroller;

        if (scrollTop + clientHeight >= scrollHeight - 5) {
            scroller.removeEventListener("scroll", onScroll);
            skip += limit;
            await fetchData(skip, limit);
            if (moreToFetch) setTimeout(activateScrollHandler, 100);
        }
    };

    activateScrollHandler();
    fetchData(skip, limit);
}
