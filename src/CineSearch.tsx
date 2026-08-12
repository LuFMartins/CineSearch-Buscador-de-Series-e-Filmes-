import { useState } from "react"
import type { Filmes } from "./types"
import "./CineSearch.css"

export function CineSearch() {

    const [filmes, setFilmes] = useState<Filmes[] | null>(null)
    const [nomeFilme, setNomeFilme] = useState('')
    const [carregando, setCarregando] = useState(false)
    const [erro, setErro] = useState<string | null>(null)

    async function buscarFilme() {

        setCarregando(true)
        setErro(null)
        const nomeLimpo = nomeFilme.trim()

        if (nomeLimpo === "" || nomeLimpo == null) {
            alert('Digite o nome do filme que deseja procurar...')
            setFilmes(null)
            setCarregando(false)
            return;
        }

        // fazer o tratamento de erro com try...catch 
        try {
            // buscar o filme na base/api
            const resFilmes = await fetch(`https://api.tvmaze.com/search/shows?q=${nomeLimpo}`)

            // (fetch não reconhece erro se der 404, 500...), temos que fazer o tratamento 'manualmente'
            if (!resFilmes.ok) {
                if (resFilmes.status === 404) {
                    throw new Error('Falha na busca (Filme não encontrado)')
                }

                throw new Error('Falha na busca! (Erro desconhecido)')
            }

            const filmeEscolhido: Filmes[] = await resFilmes.json()

            if (filmeEscolhido.length <= 0) {
                throw new Error('FILME NÃO ENCONTRADO!')
            }

            setFilmes(filmeEscolhido)

        } catch (error) {
            setFilmes(null)

            if (error instanceof Error) {
                setErro(error.message)
            } else {
                setErro('Ocorreu um ERRO DESCONHECIDO ao realizar a busca!')
            }
        } finally {
            setCarregando(false)
            setNomeFilme('')
        }

    }



    return (
        <div className="container">
            <div className="header">
                <h1>CINE SEARCH</h1>
                <div className="form">
                    <input className="campoTexto" type="text" value={nomeFilme} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNomeFilme(e.target.value)} onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => { e.key === 'Enter' && buscarFilme() }} placeholder="Digite o nome da Série || Filme"/>
                    <button className="bt" onClick={buscarFilme} disabled={carregando} >Buscar</button>
                </div>
            </div>

            <div className="resultado">
                {filmes === null && !carregando && !erro && (
                    <h2 style={{color:"rgba(100, 148, 237, 0.466)", userSelect:"none"}} >Aguardando sua pesquisa...</h2>
                )}
                {carregando && <h2 style={{color:'white'}}>BUSCANDO...</h2>}
                {erro && <h2 style={{color:'white'}}>{erro}</h2>}
                {!carregando && !erro && filmes && (
                    <ul className="blocoLista">
                        {filmes?.map((filme) => (
                            <li className="lista" key={filme.show.id}>
                                <div style={{display:'flex', flexDirection:'column', gap:'30px'}}>
                                    <h2>{filme.show.name}</h2>
                                    {filme.show.image ? (
                                        <img src={filme.show.image?.medium} alt="Capa do Filme" />
                                    ) : (
                                        <p>Imagem Indisponível</p>
                                    )}
                                </div>

                                <div className="summary">
                                    <h3>Sinopse: </h3>
                                    {/** .replace(/<[^>]*>?/gm, '') serve para remover tags HTML de um string de texto */}
                                    <p>{filme.show.summary ? filme.show.summary.replace(/<[^>]*>?/gm, '') : ('Sem sinopse')}</p>
                                </div>
                                

                                <div style={{display:'flex', flexDirection:'column', gap:'15px'}}>
                                    <h3>Gêneros:</h3>
                                    <ul>
                                        {filme.show.genres.length > 0 ? filme.show.genres.map(gen => (
                                            <li key={gen}>{gen}</li>
                                        )) : <li>Não informado!</li> }
                                    </ul>
                                
                                    <h3>Idioma:</h3>
                                    <p>{filme.show.language}</p>
                                
                                    <h3>Status:</h3>
                                    <p>{filme.show.status}</p>
                                </div>

                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}