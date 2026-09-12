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
// ESCOLHER FOTOS
// ========================================

photoInput.addEventListener("change", function () {

    const files = Array.from(this.files);

    selectedFiles = [
        ...selectedFiles,
        ...files
    ];

    mostrarPreview();

});


// ========================================
// MOSTRAR PREVIEW
// ========================================

function mostrarPreview() {

    preview.innerHTML = "";


    selectedFiles.forEach((file, index) => {

        const reader = new FileReader();


        reader.onload = function (event) {

            const item = document.createElement("div");

            item.className = "preview-item";


            item.innerHTML = `

                <img
                    src="${event.target.result}"
                    alt="Foto selecionada"
                >

                <button
                    class="remove-photo"
                    onclick="removerFoto(${index})"
                    type="button"
                >
                    ×
                </button>

            `;


            preview.appendChild(item);

        };


        reader.readAsDataURL(file);

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
// ADICIONAR FOTOS AO ÁLBUM
// ========================================

sendButton.addEventListener("click", function () {

    if (selectedFiles.length === 0) {
        return;
    }


    status.textContent =
        "Adicionando suas fotos ao álbum...";


    selectedFiles.forEach(function (file) {

        const reader = new FileReader();


        reader.onload = function (event) {

            adicionarNaGaleria(
                event.target.result
            );

        };


        reader.readAsDataURL(file);

    });


    setTimeout(function () {

        status.textContent =
            "Fotos adicionadas ao álbum!";


        selectedFiles = [];

        photoInput.value = "";

        preview.innerHTML = "";

        sendButton.disabled = true;


    }, 600);

});


// ========================================
// ADICIONAR FOTO NA GALERIA
// ========================================

function adicionarNaGaleria(src) {

    const emptyGallery =
        gallery.querySelector(".empty-gallery");


    if (emptyGallery) {

        emptyGallery.remove();

    }


    const photo =
        document.createElement("div");


    photo.className =
        "gallery-photo";


    photo.innerHTML = `

        <img
            src="${src}"
            alt="Foto compartilhada do casamento"
        >

        <a
            href="${src}"
            download="carina-e-rafael.jpg"
            class="download-button"
            title="Baixar foto"
        >
            ↓
        </a>

    `;


    gallery.appendChild(photo);

}


// ========================================
// NAVEGAÇÃO SUAVE
// ========================================

document
    .querySelectorAll('a[href^="#"]')
    .forEach(function (link) {

        link.addEventListener("click", function (event) {

            const target =
                document.querySelector(
                    this.getAttribute("href")
                );


            if (target) {

                event.preventDefault();


                target.scrollIntoView({
                    behavior: "smooth"
                });

            }

        });

    });