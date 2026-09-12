
const CLOUD_NAME = "ne8kkec1";
const UPLOAD_PRESET = "ml default";

const CLOUDINARY_URL =
    "https://api.cloudinary.com/v1_1/" +
    CLOUD_NAME +
    "/upload";

const GOOGLE_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbxT5yzJiMTZjCS-hyKn0V3I6vK26Vc6oV3H0703Dc9K9TuFe1R0y_N7xFxPLtFMcjrd/exec";


const photoInput = document.getElementById("photoInput");
const preview = document.getElementById("preview");
const sendButton = document.getElementById("sendButton");
const status = document.getElementById("status");
const gallery = document.getElementById("gallery");

let selectedFiles = [];


photoInput.addEventListener("change", function () {

    const files = Array.from(photoInput.files);

    if (files.length === 0) {
        return;
    }

    selectedFiles = selectedFiles.concat(files);

    mostrarPreview();

});


function mostrarPreview() {

    preview.innerHTML = "";

    selectedFiles.forEach(function (file, index) {

        const item = document.createElement("div");
        item.className = "preview-item";

        const imagem = document.createElement("img");
        imagem.alt = "Foto selecionada";

        const reader = new FileReader();

        reader.onload = function (event) {
            imagem.src = event.target.result;
        };

        reader.readAsDataURL(file);


        const remover = document.createElement("button");

        remover.type = "button";
        remover.className = "remove-photo";
        remover.textContent = "×";

        remover.onclick = function () {
            selectedFiles.splice(index, 1);
            mostrarPreview();
        };


        item.appendChild(imagem);
        item.appendChild(remover);

        preview.appendChild(item);

    });


    sendButton.disabled =
        selectedFiles.length === 0;

}


async function enviarParaCloudinary(file) {

    const formData = new FormData();

    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);


    const resposta = await fetch(
        CLOUDINARY_URL,
        {
            method: "POST",
            body: formData
        }
    );


    const resultado = await resposta.json();


    if (!resposta.ok) {

        throw new Error(
            resultado.error &&
            resultado.error.message
                ? resultado.error.message
                : "Erro no Cloudinary."
        );

    }


    if (!resultado.secure_url) {

        throw new Error(
            "URL da foto não recebida."
        );

    }


    return resultado.secure_url;

}


async function salvarFotoNaPlanilha(url) {

    const dados = JSON.stringify({
        url: url,
        nome: "Convidado"
    });


    try {

        await fetch(
            GOOGLE_SCRIPT_URL,
            {
                method: "POST",
                mode: "no-cors",
                headers: {
                    "Content-Type":
                        "text/plain;charset=utf-8"
                },
                body: dados
            }
        );

    } catch (erro) {

        console.error(
            "Erro ao salvar na planilha:",
            erro
        );

    }

}


function adicionarNaGaleria(url) {

    const vazio =
        gallery.querySelector(".empty-gallery");

    if (vazio) {
        vazio.remove();
    }


    const foto =
        document.createElement("div");

    foto.className =
        "gallery-photo";


    const imagem =
        document.createElement("img");

    imagem.src = url;
    imagem.alt = "Foto compartilhada";
    imagem.loading = "lazy";


    const baixar =
        document.createElement("a");

    baixar.href = url;
    baixar.target = "_blank";
    baixar.rel = "noopener noreferrer";
    baixar.className = "download-button";
    baixar.title = "Abrir foto";
    baixar.textContent = "↓";


    foto.appendChild(imagem);
    foto.appendChild(baixar);

    gallery.appendChild(foto);

}


async function carregarGaleria() {

    try {

        const resposta = await fetch(
            GOOGLE_SCRIPT_URL +
            "?t=" +
            Date.now()
        );


        if (!resposta.ok) {
            return;
        }


        const fotos =
            await resposta.json();


        if (!Array.isArray(fotos)) {
            return;
        }


        fotos.forEach(function (foto) {

            if (
                foto &&
                typeof foto.url === "string" &&
                foto.url.trim() !== ""
            ) {

                adicionarNaGaleria(
                    foto.url
                );

            }

        });


    } catch (erro) {

        console.error(
            "Erro ao carregar fotos:",
            erro
        );

    }

}


sendButton.addEventListener(
    "click",
    async function () {

        if (selectedFiles.length === 0) {

            return;

        }


        sendButton.disabled = true;
        photoInput.disabled = true;


        const arquivos =
            selectedFiles.slice();


        let enviadas = 0;


        for (
            let i = 0;
            i < arquivos.length;
            i++
        ) {

            const arquivo =
                arquivos[i];


            status.textContent =
                "Enviando foto " +
                (i + 1) +
                " de " +
                arquivos.length +
                "...";


            try {

                const url =
                    await enviarParaCloudinary(
                        arquivo
                    );


                await salvarFotoNaPlanilha(
                    url
                );


                adicionarNaGaleria(
                    url
                );


                enviadas++;


            } catch (erro) {

                console.error(
                    "Erro ao enviar:",
                    erro
                );

            }

        }


        if (enviadas === arquivos.length) {

            status.textContent =
                enviadas === 1
                    ? "Foto enviada com sucesso! 💜"
                    : enviadas +
                      " fotos enviadas com sucesso! 💜";

        } else if (enviadas > 0) {

            status.textContent =
                enviadas +
                " foto(s) enviada(s) com sucesso!";

        } else {

            status.textContent =
                "Não foi possível enviar as fotos.";

        }


        selectedFiles = [];

        photoInput.value = "";

        preview.innerHTML = "";


        photoInput.disabled = false;
        sendButton.disabled = true;

    }
);


carregarGaleria();


document.querySelectorAll(
    'a[href^="#"]'
).forEach(function (link) {

    link.addEventListener(
        "click",
        function (event) {

            const id =
                link.getAttribute("href");

            const destino =
                document.querySelector(id);


            if (destino) {

                event.preventDefault();

                destino.scrollIntoView({
                    behavior: "smooth"
                });

            }

        }
    );

});

