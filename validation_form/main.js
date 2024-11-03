const express = require("express");

const webserver = express();

webserver.use(express.urlencoded({ extended:true }));

const PORT = 8380;

const removeHTML = (text) => {
    if (!text)
        return "";
    text=text.toString()
        .split("&").join("&amp;")
        .split("<").join("&lt;")
        .split(">").join("&gt;")
        .split('"').join("&quot;")
        .split("'").join("&#039;");
    return text;
}


const getDataForm = (data, errors) => `
<form method="POST" action="/send">
    <label for="name">Имя: </label>
    <input type="text" name="name" value="${removeHTML(data.name)}">
    <span style="color:red">${errors && errors.name || ""}</span>
    <br>
    <label for="age">Возраст: </label>
    <input type="text" name="age" value="${removeHTML(data.age)}">
    <span style="color:red">${errors && errors.age || ""}</span>
    <br>
    <label for="email">E-mail: </label>
    <input type="text" name="email" value="${removeHTML(data.email)}">
    <span style="color:red">${errors && errors.email || ""}</span>
    <br>
    <input type="submit" value="Отправить">
</form>
`;

const getSuccessPage = (data) => `
<p>
    Успех!
    <br>
    Ваше имя: ${removeHTML(data.name)}
    <br>
    Ваш возраст: ${removeHTML(data.age)}
    <br>
    Ваш E-mail: ${removeHTML(data.email)}
</p>    
`;

const emailRegExp = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

const errorsMap = {
    "required": "Обязательное поле",
    "notInteger": "Введите целое число",
    "notEmail": "Невалидный email",
}

webserver.get("/", (req, res) => {
    const pureForm = getDataForm({}, null)
    res.send(pureForm);
});

webserver.post("/send", (req, res) => {
    const formErrors = {};
    const formData = req.body;

    if (!formData.name) {
        formErrors.name = errorsMap.required;
    }

    if (!formData.age) {
        formErrors.age = errorsMap.required;
    } else if (isNaN(formData.age) || !Number.isInteger(Number(formData.age))) {
        formErrors.age = errorsMap.notInteger;
    }

    if (!formData.email) {
        formErrors.email = errorsMap.required;
    } else if (!formData.email.match(emailRegExp)) {
        formErrors.email = errorsMap.notEmail;
    }

    if (Object.entries(formErrors).length > 0) {
        const formWithErrors = getDataForm(formData, formErrors);
        res.send(formWithErrors);
    } else {
        const successPage = getSuccessPage(formData);
        res.send(successPage);
    }
});

webserver.listen(PORT,()=> {
    console.log("web server running on port " + PORT);
});
