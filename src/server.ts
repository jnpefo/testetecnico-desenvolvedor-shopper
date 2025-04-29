import app from "./app";

const port = 3030; // Porta especificada no teste
app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});