import m from 'mithril';
import { Pokedex } from 'pokeapi-js-wrapper';
import { ITypeResponse } from './type_to_nodes';
import { PokemonTypeDict, Result, PokemonDataDict, PokemonData } from './utils';
import { typeToNodes } from './type_to_nodes';

interface IPokedex {
    getTypeNodes: () => Result<PokemonTypeDict>;
    getPokemonData: () => Result<PokemonDataDict>;
}

export class ResultPokedex implements IPokedex {
    typeNodesResult: Result<PokemonTypeDict> = {
        status: 'LOADING',
        value: ({} as PokemonTypeDict),
    };

    pokemonDataResult: Result<PokemonDataDict> = {
        status: 'LOADING',
        value: ({} as PokemonDataDict),
    };

    constructor(indexCutoff: number, includeNonDefault: boolean) {
        const pokedex = new Pokedex({
            protocol: 'https',
            cache: true,
            timeout: 5 * 1000,
        });
        window.pokedex = pokedex;

        this.loadTypeData(pokedex);
        this.loadPokemonData(pokedex, indexCutoff, includeNonDefault);
    }

    loadTypeData(pokedex) {
        pokedex.getTypesList()
          .then(types => types.results
                .map(result => result.name)
                .filter((name: string) => name !== 'shadow' && name !== 'unknown')
          )
          .then((names: string[]) => {
              return Promise.all(names.map(name => pokedex.getTypeByName(name)));
          })
          .then((types: ITypeResponse[]) => {
              const output: PokemonTypeDict = {} as PokemonTypeDict;
              types.forEach((t: ITypeResponse) => {
                  output[t.name] = typeToNodes(t);
              })
              this.typeNodesResult.value = output;
              this.typeNodesResult.status = 'SUCCESS';
              m.redraw();
          })
          .catch((e: Error) => {
              this.typeNodesResult.status = 'ERROR';
          });
    }

    loadPokemonData(pokedex, indexCutoff: string, includeNonDefault: boolean) {
        pokedex.getPokedexByName('national')
            .then(nationalDex => nationalDex.pokemon_entries
                .slice(0, indexCutoff)
                .map(e => e.pokemon_species.name)
            )
            .then((allNames: string[]) => {
                return Promise.allSettled(allNames.map(name => pokedex.getPokemonSpeciesByName(name)))
            })
            .then((allSpecies: string[]) => {
                const allVarieties = [];
                allSpecies.forEach((settled, i) => {
                    if (settled.status === 'fulfilled') {
                        settled.value.varieties.forEach(variety => {
                            const shouldAdd = (includeNonDefault && !variety.is_default) || variety.is_default;
                            if (shouldAdd) {
                                allVarieties.push({
                                    index: i,
                                    name: variety.pokemon.name,
                                });
                            }
                        });
                    }
                });
                return Promise.allSettled(allVarieties.map(({index, name}) => {
                    return new Promise((resolve, reject) => {
                        const wrapped = pokedex.getPokemonByName(name);
                        wrapped
                          .then(pokemon => {
                              resolve({index, pokemon});
                          })
                          .catch(error => {
                              reject(error);
                          });
                    });

                    //async ({index, name}) => {
                    //  const pokemon = await pokedex.getPokemonByName(name);
                    //  return {index, pokemon};
                    //};
                    //return { index, pokemon: pokedex.getPokemonByName(name)};
                }));
            })
            .then(allPokemonSettled => {
                const allPokemon = allPokemonSettled
                  .filter(settled => settled.status === 'fulfilled')
                  .map(settled => settled.value);

                console.log(allPokemonSettled.filter(s => s.status === 'rejected').map(s => s.reason));
                const asPokemon: PokemonData[] = allPokemon.map(({index, pokemon}) => {
                    return {
                        'name': pokemon.name,
                        'types': pokemon.types.map(t => t.type.name),
                        'index': index,
                        'official_artwork': pokemon.sprites.other['official-artwork'].front_default,
                        'animated_artwork': pokemon.sprites.versions['generation-v']['black-white'].animated.front_default,
                    };
                });
                const pokemonDataDict: PokemonDataDict = {} as PokemonDataDict;
                asPokemon.forEach(pokemon => {
                    pokemonDataDict[pokemon.name] = pokemon;
                });
                this.pokemonDataResult.value = pokemonDataDict;
                this.pokemonDataResult.status = 'SUCCESS';
                m.redraw();
            })
            .catch((e: Error) => {
                this.pokemonDataResult.status = 'ERROR';
            });
    }

    getTypeNodes() {
        return this.typeNodesResult;
    }

    getPokemonData() {
        return this.pokemonDataResult;
    }
}
