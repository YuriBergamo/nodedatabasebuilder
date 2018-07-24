/*
*   Gerador de combos arquivo para gerar o conteudo das carteiras de cadastro
*
* */


const _class = "br.com.finchsolucoes.itau.data.infraestrutura.domain.CombosArquivoDomain";


function geraCombosArquivo(listaChaveValor, carteira, nomeEntidade, tipo) {
    if(listaChaveValor){
        let count = 0;
        return listaChaveValor.map(e => {
            return {
                "_class":_class,
                "carteira":carteira,
                "entidade":nomeEntidade,
                "tipo":tipo,
                "descricao":e.valor,
                "idExterno":e.chave,
                "ordem": count++
            }
        })
    }
}


function geraEmpresaOrgaoCredicard(listaChaveValor) {
    return geraCombosArquivo(listaChaveValor, "CREDICARD", "Empresa Órgão", "COMBO_ASYNC");
}

const Cadastro  = {
    "geraEmpresaOrgaoCredicard":function (listaChaveValor) {
        return geraEmpresaOrgaoCredicard(listaChaveValor);
    }
}


module.exports = Cadastro;
