import { useState } from "react"
import type { Filmes } from "./types"

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
            setErro('Digite o nome do filme que deseja procurar...')
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
            <div className="form">
                <input type="text" value={nomeFilme} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNomeFilme(e.target.value)} onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => { e.key === 'Enter' && buscarFilme() }} />
                <button onClick={buscarFilme} disabled={carregando}>{carregando ? 'Buscando...' : 'Buscar'}</button>
            </div>

            <div className="resultado">
                {carregando && <h2>BUSCANDO...</h2>}
                {erro && <h2>{erro}</h2>}
                {!carregando && !erro && filmes && (
                    <ul>
                        {filmes?.map((filme) => (
                            <li key={filme.show.id}>
                                <h2>{filme.show.name}</h2>

                                {filme.show.image ? (
                                    <img src={filme.show.image?.medium} alt="Capa do Filme" />
                                ) : (
                                    <p>Imagem Indisponível</p>
                                )}

                                <h3>Sinopse: </h3>
                                {/** .replace(/<[^>]*>?/gm, '') serve para remover tags HTML de um string de texto */}
                                <p>{filme.show.summary ? filme.show.summary.replace(/<[^>]*>?/gm, '') : ('Sem sinopse')}</p> 
                                

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

                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}