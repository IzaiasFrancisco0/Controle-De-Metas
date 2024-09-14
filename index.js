/*
let meta = {
    value: 'ler um livro por mês',
    checked: false,
    isChecked: (info) => {
        console.log(info)
    }
}

meta.isChecked('qualquer informação')
*/

//importei as propriedades na biblioteca inquire
const { select, input, checkbox } = require('@inquirer/prompts');
const fs = require("fs").promises

let mensagem = 'Bem vindo ao app de metas!!';

/*
//criei um objeto, para criar um exemplo de uma meta começando com o checked false, quer dizer que ainda não concluiu
let meta = {
    value: 'Tomar 3L de agua por dia',
    checked: false
}
*/
//aqui dentro da variavel metas, passei o objeto meta para dentro do array
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
//aqui eu crio uma função async, cadastrar meta
const cadastrarMeta = async () => {
    //passo o imput para dentro da variavel meta, onde ele vai receber dentro dele uma meta
    const meta = await input({ message: "Digite a meta" });

    //verifico se dentro do input o usuario digitou alguma coisa, se for igual a zero significa que o usuario não digitou nada
    if (meta.length === 0) {
        mensagem = 'A meta não pode ser vazia';
        return;
    }

    //aqui adiciono dentro do array a meta, criada pelo o usuario
    metas.push({ value: meta, checked: false });

    mensagem = "Meta cadastrada com sucesso!!";
}

//função para listar as metas
const listarMetas = async () => {
    // Cria uma lista de escolhas sem passar referências diretas aos objetos
    const escolhas = metas.map((meta) => ({ name: meta.value, value: meta.value, checked: meta.checked }));

    //dentro d avariavel respostas passo o checkbox onde vai selecionar alguma meta, ele vai começar false, vazio.
    const respostas = await checkbox({
        message: 'Use as setas para mudar de meta, o espaço para marcar ou desmarcar e o enter para finalizar essa etapa',
        choices: escolhas,
        instructions: false,
    });
    
    //ou seja se o usuario não seleciona nemhuma meta, quer dizer que nao concluiu
    if (respostas.length === 0) {
       mensagem = "Nenhuma meta selecionada!";
        return;
    }

    // Resetando todas as metas
    metas.forEach((m) => {
        m.checked = false;
    });

    // Marcando as metas selecionadas, e colocando true para saber que o usuario escolheu aquela meta e realizou.
    respostas.forEach((resposta) => {
        const meta = metas.find((m) => m.value === resposta);
        if (meta) {
            meta.checked = true;
        }
    });

   mensagem = 'Metas marcadas como concluidas!!'
}

//função metas abertas
const metasRealizadas = async () => {
    //dentro da variavel realizadas vou filtrar o array metas e aquele que tiver a meta realizada retorne
    const realizadas = metas.filter((meta) => meta.checked);

    //se realizadas for igual a 0 quer dizer que nao realizou nemhuma meta
    if (realizadas.length === 0) {
        console.log("Não existe meta realizada!!");
        return;
    }

    await select({
        message: "Metas realizadas: " + realizadas.length,
        choices: realizadas.map(meta => ({ name: meta.value, value: meta.value })),
    });
}

//funçao metas abertas
const metasAbertas = async () => {
    //dentro da variavel abertas eu filtro metas, e eu nego o metodo meta.checked.
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
