
// ========================================
// CONFIGURAÇÕES
// ========================================

const CLOUD_NAME = "ne8kkec1";
const UPLOAD_PRESET = "ml default";

const CLOUDINARY_URL =
    "https://api.cloudinary.com/v1_1/" +
    CLOUD_NAME +
    "/upload";

const GOOGLE_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbxT5yzJiMTZjCS-hyKn0V3I6vK26Vc6oV3H0703Dc9K9TuFe1R0y_N7xFxPLtFMcjrd/exec";


// ========================================
// ELEMENTOS DO SITE
// ========================================

const photoInput = document.getElementById("photoInput");
const preview = document.getElementById("preview");
const sendButton = document.getElementById("sendButton");
const status = document.getElementById("status");
const gallery = document.getElementById("gallery");


// ========================================
// FOTOS SELECIONADAS
// ========================================

let selectedFiles = [];


// ========================================
// CARREGAR GALERIA AO ABRIR O SITE
// ========================================

window.addEventListener("load", carregarGaleria);


// ========================================
// ESCOLHER FOTOS
// ========================================

photoInput.addEventListener("change", function () {

    const novasFotos = Array.from(photoInput.files);

    selectedFiles = selectedFiles.concat(novasFotos);

    mostrarPreview();

});


// ========================================
// MOSTRAR PREVIEW
// ========================================

function mostrarPreview() {

    preview.innerHTML = "";

    selectedFiles.forEach(function (file, index) {

        const reader = new FileReader();

        reader.onload = function (event) {

            const item = document.createElement("div");

            item.className = "preview-item";

            const imagem = document.createElement("img");

            imagem.src = event.target.result;

            imagem.alt = "Foto selecionada";

            const botao = document.createElement("button");

            botao.type = "button";

            botao.className = "remove-photo";

            botao.textContent = "×";

            botao.addEventListener("click", function () {

                removerFoto(index);

            });

            item.appendChild(imagem);

            item.appendChild(botao);

            preview.appendChild(item);

        };

        reader.readAsDataURL(file);

    });

    sendButton.disabled = selectedFiles.length === 0;

}


// ========================================
// REMOVER FOTO
// ========================================

function removerFoto(index) {

    selectedFiles.splice(index, 1);

    mostrarPreview();

}


// ========================================
// ENVIAR FOTO PARA O CLOUDINARY
// ========================================

async function enviarParaCloudinary(file) {

    const dados = new FormData();

    dados.append("file", file);

    dados.append("upload_preset", UPLOAD_PRESET);

    const resposta = await fetch(
        CLOUDINARY_URL,
        {
            method: "POST",
            body: dados
        }
    );

    if (!resposta.ok) {

        throw new Error(
            "Erro ao enviar foto para o Cloudinary."
        );

    }

    const resultado = await resposta.json();

    if (!resultado.secure_url) {

        throw new Error(
            "O Cloudinary não retornou o endereço da foto."
        );

    }

    return resultado.secure_url;

}


// ========================================
// SALVAR FOTO NO GOOGLE SHEETS
// ========================================

async function salvarFotoNaPlanilha(url) {

    const dados = JSON.stringify({
        url: url,
        nome: "Convidado"
    });

    await fetch(
        GOOGLE_SCRIPT_URL,
        {
            method: "POST",
            mode: "no-cors",
            headers: {
                "Content-Type": "text/plain;charset=utf-8"
            },
            body: dados
        }
    );

}


// ========================================
// CRIAR FOTO NA GALERIA
// ========================================

function adicionarNaGaleria(url) {

    const aviso =
        gallery.querySelector(".empty-gallery");

    if (aviso) {

        aviso.remove();

    }


    const foto =
        document.createElement("div");

    foto.className = "gallery-photo";


    const imagem =
        document.createElement("img");

    imagem.src = url;

    imagem.alt =
        "Foto compartilhada do casamento";

    imagem.loading = "lazy";


    const baixar =
        document.createElement("a");

    baixar.href = url;

    baixar.target = "_blank";

    baixar.rel = "noopener noreferrer";

    baixar.className =
        "download-button";

    baixar.title =
        "Baixar foto";

    baixar.textContent = "↓";


    foto.appendChild(imagem);

    foto.appendChild(baixar);

    gallery.appendChild(foto);

}


// ========================================
// CARREGAR FOTOS DA PLANILHA
// ========================================

async function carregarGaleria() {

    try {

        const resposta =
            await fetch(
                GOOGLE_SCRIPT_URL +
                "?t=" +
                Date.now()
            );


        if (!resposta.ok) {

            throw new Error(
                "Erro ao consultar a galeria."
            );

        }


        const fotos =
            await resposta.json();


        if (!Array.isArray(fotos)) {

            return;

        }


        fotos.forEach(function (foto) {

            if (
                foto &&
                foto.url &&
                foto.url.trim() !== ""
            ) {

                adicionarNaGaleria(
                    foto.url
                );

            }

        });


    } catch (erro) {

        console.error(
            "Erro ao carregar galeria:",
            erro
        );

    }

}


// ========================================
// ENVIAR TODAS AS FOTOS
// ========================================

sendButton.addEventListener(
    "click",
    async function () {

        if (selectedFiles.length === 0) {

            return;

        }


        sendButton.disabled = true;

        photoInput.disabled = true;


        const fotosParaEnviar =
            selectedFiles.slice();


        let quantidadeEnviada = 0;


        try {

            for (
                let i = 0;
                i < fotosParaEnviar.length;
                i++
            ) {

                const file =
                    fotosParaEnviar[i];


                status.textContent =
                    "Enviando foto " +
                    (i + 1) +
                    " de " +
                    fotosParaEnviar.length +
                    "...";


                // -------------------------
                // 1. CLOUDINARY
                // -------------------------

                const url =
                    await enviarParaCloudinary(
                        file
                    );


                // -------------------------
                // 2. GOOGLE SHEETS
                // -------------------------

                await salvarFotoNaPlanilha(
                    url
                );


                // -------------------------
                // 3. GALERIA
                // -------------------------

                adicionarNaGaleria(
                    url
                );


                quantidadeEnviada++;

            }


            status.textContent =
                quantidadeEnviada +
                (
                    quantidadeEnviada === 1
                        ? " foto enviada com sucesso! 💜"
                        : " fotos enviadas com sucesso! 💜"
                );


            selectedFiles = [];

            photoInput.value = "";

            preview.innerHTML = "";


        } catch (erro) {

            console.error(
                "Erro no envio:",
                erro
            );


            status.textContent =
                "Ocorreu um erro ao enviar a foto. Tente novamente.";


        }


        photoInput.disabled = false;

        sendButton.disabled =
            selectedFiles.length === 0;

    }
);


// ========================================
// NAVEGAÇÃO SUAVE
// ========================================

const links =
    document.querySelectorAll(
        'a[href^="#"]'
    );


links.forEach(function (link) {

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
