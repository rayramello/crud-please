// � Importando módulos
// � Inicializa o servidor Express
const express = require("express"); // Framework para criar o servidor
const sqlite3 = require("sqlite3").verbose(); // Banco de dados SQLite
const cors = require("cors"); // Permite requisições entre frontend e backend
const bodyParser = require("body-parser"); // Middleware para processar JSON

const app = express();
app.use(cors());  // Permite comunicação do frontend
app.use(bodyParser.json());  // Processa JSON no corpo da requisição

// � Conexão com o Banco de Dados SQLite

const db = new sqlite3.Database("meusite", err =>{  // Tentando conctar com o banco de dandos se o arquivo não existir, será criado automaticamente
    if(err) console.error("Erro ao conectar ao SQLite", err); // verificar se ocorreu algum error ao tenta conctar e se houver erro exibe uma mensagem
    else console.log("Banco de dados SQLite conectado!"); // Se não houve erro exibe outra mensagem de conecção
});

// � Criar a tabela 'usuarios' se não existir
db.serialize(() => {  //Isso organiza as operações do banco de dados para serem executadas de maneira sequencial

  db.run("CREATE TABLE IF NOT EXISTS usuarios (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT)"); // Esse comando cria a tabela "usuarios" no banco de dados, caso ela ainda não exista e inicia ela caso ja exista.
    console.log("✅ Tabela 'usuarios' verificada/criada com sucesso.");
    });

    // � Rota para salvar um novo usuário
app.post("/salvar", (req, res) => {  //Configura uma rota POST chamada /salvar para processar requisições que enviem dados para serem salvos no banco.
    const { nome } = req.body; //Pega o campo nome enviado na requisição no formato JSON. Isso é possível porque o servidor usa o body-parser para processar o JSON. 
    if (!nome) return res.status(400).json({ mensagem: "Nome é obrigatório!" }); //Verifica se o campo nome foi enviado. Se não tiver sido fornecido, retorna um erro 400 (Bad Request) com a mensagem "Nome é obrigatório!".
    
    const sql = "INSERT INTO usuarios (nome) VALUES (?)"; //Define o comando SQL que insere o valor do campo nome na tabela usuarios.
    db.run(sql, [nome], function (err) { //Executa o comando SQL, substituindo o ? pelo valor do nome enviado.
    if (err) { //Se houver erro durante a inserção, retorna um erro 500 (Internal Server Error) com a mensagem "Erro ao salvar no banco.".
        console.error("Erro ao inserir:", err);
        return res.status(500).json({ mensagem: "Erro ao salvar no banco." });
    }
        res.json({ mensagem: "Nome salvo com sucesso!", id: this.lastID }); //Caso contrário, retorna uma resposta JSON contendo: Mensagem de sucesso: "Nome salvo com sucesso!"
        });
    });

    //Rota para listar todos os usuários
    app.get("/usuarios", (req, res)=>{ // Isso configura uma rota chamada /usuarios que será acessada para listar os dados armazenados na tabela usuarios.
        db.all("SELECT * FROM usuarios",[],(err,rows)=>{ //Executa o comando SQL SELECT * FROM usuarios, que significa "selecione todos os registros da tabela usuarios". O segundo argumento (um array vazio []) indica que não há parâmetros dinâmicos no comando.
        //O callback (err, rows) => {...} é usado para lidar com o resultado:
        //err: Captura um erro, caso tenha ocorrido durante a execução do comando.
        //rows: Contém os registros retornados pelo banco de dados.

            if (err) {  //Verifica se houve algum problema ao buscar os dados.
                console.error("Erro ao buscar usuários.",err);
                return res.status(500).json({mensagem: "Erro ao buscar usuários."}); //Retorna ao cliente uma resposta HTTP com status 500 (erro interno do servidor) e uma mensagem JSON: {mensagem: "Erro ao buscar usuários."}.
            }
            res.json(rows); //Se a consulta for bem-sucedida, a função retorna os registros encontrados (no formato JSON) como resposta para o cliente.
        });
    });


    // 📌 Atualizar um usuário (rota PUT)
app.put("/editar/:id", (req, res) => {
    const { id } = req.params;
    const { nome } = req.body;
    if (!nome) return res.status(400).json({ mensagem: "Nome é obrigatório!" });
    
    const sql = "UPDATE usuarios SET nome = ? WHERE id = ?";
    db.run(sql, [nome, id], function (err) {
    if (err) {
    console.error("Erro ao atualizar usuário:", err);
    return res.status(500).json({ mensagem: "Erro ao atualizar usuário." });
    }
    res.json({ mensagem: "Usuário atualizado com sucesso!" });
    });
    });
    
    // 📌 Remover um usuário (rota DELETE)
    app.delete("/deletar/:id", (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM usuarios WHERE id = ?";
    db.run(sql, [id], function (err) {
    if (err) {
    console.error("Erro ao excluir usuário:", err);
    return res.status(500).json({ mensagem: "Erro ao excluir usuário." });
    }
    res.json({ mensagem: "Usuário excluído com sucesso!" });
    });
    });

    // � Inicia o servidor na porta 3000
app.listen(3000, () => {
    console.log("� Servidor rodando na porta 3000");
    }); //Essa função inicia o servidor na porta 3000. Portas funcionam como "canais" que permitem que diferentes aplicativos se comuniquem.


