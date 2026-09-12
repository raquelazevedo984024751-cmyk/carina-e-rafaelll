```javascript
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
// ELEMENTOS
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
// INICIAR
// ========================================

window.addEventListener("load", function () {

    carregarGaleria();

});


// ========================================
// SELECIONAR FOTOS
// ========================================

photoInput.addEventListener("change", function () {

    const novasFotos = Array.from(photoInput.files);

    if (novasFotos.length === 0) {
        return;
    }

    selectedFiles = selectedFiles.concat(novasFotos);

    mostrarPreview();

});


// ========================================
// MOSTRAR PREVIEW
// ========================================

function mostrarPreview() {

    preview.innerHTML = "";

    selectedFiles.forEach(function (file, index) {

        const item = document.createElement("div");

        item.className = "preview-item";


        const imagem = document.createElement("img");

        imagem.src = URL.createObjectURL(file);

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

    });


    sendButton.disabled =
        selectedFiles.length === 0;

}


// ========================================
// REMOVER FOTO
// ========================================

function removerFoto(index) {

    selectedFiles.splice(index, 1);

    mostrarPreview();

}


// ========================================
// ENVIAR PARA CLOUDINARY
// ========================================

async function enviarParaCloudinary(file) {

    const dados = new FormData();

    dados.append("file", file);

    dados.append(
        "upload_preset",
        UPLOAD_PRESET
    );


    const resposta = await fetch(
        CLOUDINARY_URL,
        {
            method: "POST",
            body: dados
        }
    );


    let resultado;

    try {

        resultado = await resposta.json();

    } catch (erro) {

        throw new Error(
            "O Cloudinary não retornou uma resposta válida."
        );

    }


    if (!resposta.ok) {

        console.error(
            "Erro Cloudinary:",
            resultado
        );

        throw new Error(
            resultado.error?.message ||
            "O Cloudinary recusou a foto."
        );

    }


    if (!resultado.secure_url) {

        console.error(
            "Resposta Cloudinary:",
            resultado
        );

        throw new Error(
            "O Cloudinary não retornou o endereço da foto."
        );

    }


    return resultado.secure_url;

}


// ========================================
// SALVAR NO GOOGLE SHEETS
// ========================================

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
            "Erro ao salvar no Google Sheets:",
            erro
        );

        // Não impede a foto de aparecer no álbum.
        // O Cloudinary já recebeu a imagem.

    }

}


// ========================================
// ADICIONAR NA GALERIA
// ========================================

function adicionarNaGaleria(url) {

    const aviso =
        gallery.querySelector(".empty-gallery");


    if (aviso) {

        aviso.remove();

    }


    const foto =
        document.createElement("div");

    foto.className =
        "gallery-photo";


    const imagem =
        document.createElement("img");

    imagem.src = url;

    imagem.alt =
        "Foto compartilhada do casamento";

    imagem.loading =
        "lazy";


    const baixar =
        document.createElement("a");

    baixar.href = url;

    baixar.target = "_blank";

    baixar.rel =
        "noopener noreferrer";

    baixar.className =
        "download-button";

    baixar.title =
        "Abrir foto";

    baixar.textContent =
        "↓";


    foto.appendChild(imagem);

    foto.appendChild(baixar);

    gallery.appendChild(foto);

}


// ========================================
// CARREGAR GALERIA
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
                "Não foi possível carregar a galeria."
            );

        }


        const fotos =
            await resposta.json();


        if (!Array.isArray(fotos)) {

            console.error(
                "Resposta inválida:",
                fotos
            );

            return;

        }


        fotos.forEach(function (foto) {

            if (
                foto &&
                foto.url &&
                typeof foto.url === "string"
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
// ENVIAR FOTOS
// ========================================

sendButton.addEventListener(
    "click",
    async function () {

        if (selectedFiles.length === 0) {

            return;

        }


        const fotos =
            selectedFiles.slice();


        sendButton.disabled = true;

        photoInput.disabled = true;


        let enviadas = 0;

        let erros = 0;


        try {

            for (
                let i = 0;
                i < fotos.length;
                i++
            ) {

                const file =
                    fotos[i];


                status.textContent =
                    "Enviando foto " +
                    (i + 1) +
                    " de " +
                    fotos.length +
                    "...";


                try {

                    // -------------------------
                    // CLOUDINARY
                    // -------------------------

                    const url =
                        await enviarParaCloudinary(
                            file
                        );


                    // -------------------------
                    // GOOGLE SHEETS
                    // -------------------------

                    await salvarFotoNaPlanilha(
                        url
                    );


                    // -------------------------
                    // GALERIA
                    // -------------------------

                    adicionarNaGaleria(
                        url
                    );


                    enviadas++;


                } catch (erroFoto) {

                    erros++;


                    console.error(
                        "Erro na foto " +
                        (i + 1) +
                        ":",
                        erroFoto
                    );

                }

            }


            // ========================================
            // RESULTADO
            // ========================================

            if (
                enviadas > 0 &&
                erros === 0
            ) {

                status.textContent =
                    enviadas === 1
                        ? "Foto enviada com sucesso! 💜"
                        : enviadas +
                          " fotos enviadas com sucesso! 💜";

            } else if (
                enviadas > 0 &&
                erros > 0
            ) {

                status.textContent =
                    enviadas +
                    " foto(s) enviada(s). " +
                    erros +
                    " não puderam ser enviadas.";

            } else {

                status.textContent =
                    "Não foi possível enviar as fotos. Verifique o Cloudinary.";

            }


            // Limpar seleção

            selectedFiles = [];

            photoInput.value = "";

            preview.innerHTML = "";


        } catch (erro) {

            console.error(
                "Erro geral:",
                erro
            );


            status.textContent =
                "Ocorreu um erro. Tente novamente.";

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
```
