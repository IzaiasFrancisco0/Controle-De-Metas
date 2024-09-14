
const { select, input, checkbox } = require('@inquirer/prompts');
const fs = require("fs").promises

let mensagem = 'Bem vindo ao app de metas!!';

let metas;

const carregarMetas = async() => {
    try{
        const dados = await fs.readFile("metas.json", "utf-8");
        metas = JSON.parse(dados)
    } catch(erro){
       metas = []
    }
}

const salvarMetas = async() =>{
    await fs.writeFile("metas.json", JSON.stringify(metas, null, 2))
}

const cadastrarMeta = async () => {
    const meta = await input({ message: "Digite a meta" });

    if (meta.length === 0) {
        mensagem = 'A meta não pode ser vazia';
        return;
    }

    metas.push({ value: meta, checked: false });
    
    mensagem = "Meta cadastrada com sucesso!!";
}


const listarMetas = async () => {
    const escolhas = metas.map((meta) => ({ name: meta.value, value: meta.value, checked: meta.checked }));

    const respostas = await checkbox({
        message: 'Use as setas para mudar de meta, o espaço para marcar ou desmarcar e o enter para finalizar essa etapa',
        choices: escolhas,
        instructions: false,
    });
    
    if (respostas.length === 0) {
       mensagem = "Nenhuma meta selecionada!";
        return;
    }

    metas.forEach((m) => {
        m.checked = false;
    });

    respostas.forEach((resposta) => {
        const meta = metas.find((m) => m.value === resposta);
        if (meta) {
            meta.checked = true;
        }
    });

   mensagem = 'Metas marcadas como concluidas!!'
}

const metasRealizadas = async () => {
    const realizadas = metas.filter((meta) => meta.checked);

    if (realizadas.length === 0) {
        console.log("Não existe meta realizada!!");
        return;
    }
    await select({
        message: "Metas realizadas: " + realizadas.length,
        choices: realizadas.map(meta => ({ name: meta.value, value: meta.value })),
    });
}

const metasAbertas = async () => {
    const abertas = metas.filter((meta) => !meta.checked);

    if (abertas.length === 0) {
        mensagem = "Não existe metas abertas!!";
        return;
    }
    await select({
        message: "Metas abertas: " + abertas.length,
        choices: abertas.map(meta => ({ name: meta.value, value: meta.value })),
    });
}

const deletarMetas = async() =>{
   const metasDesmarcadas =  metas.map((item) => {
      return ({value: item.value, checked: false})
   })

   const itensDeletar = await checkbox({
    message: 'Selecione um item para deletar',
    choices: [...metasDesmarcadas],
    instructions: false,
   })
   if(itensDeletar === 0){
    mensagem = "Nemhum item a deletar";
    return
   }
   itensDeletar.forEach((item) => {
       metas = metas.filter((meta) => {
        return meta.value !== item;
       })
   })
   mensagem = "Metas deletadas com sucesso";
}

const mostrarMensagem = () =>{
   console.clear()
   if(mensagem !== ''){
    console.log(mensagem);
    console.log("");
    mensagem = '';
   }
}
const start = async () => {
    await carregarMetas();
    while (true) {
        
        mostrarMensagem();
        await salvarMetas()

        let opcao = await select({
            message: "Menu >",
            choices: [
                { name: "Cadastrar meta", value: "cadastrar" },
                { name: "Listar metas", value: "listar" },
                { name: "Metas realizadas", value: "metas realizadas" },
                { name: "Metas abertas", value: "abertas" },
                { name: "Deletar metas", value: "deletar" },
                { name: "Sair", value: "sair" },
            ]
        });

        switch (opcao) {
            case 'cadastrar':
                await cadastrarMeta();
                break;
            case 'listar':
                await listarMetas();
                break;
            case 'metas realizadas':
                await metasRealizadas();
                break;
            case 'abertas':
                await metasAbertas();
                break;
                case 'deletar':
                    await deletarMetas();
                    break;
            case "sair":
                console.log("Até a próxima");
                return;
        }
    }
}

start();
