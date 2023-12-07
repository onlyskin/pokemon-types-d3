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

    constructor() {
        const pokedex = new Pokedex({
            protocol: 'https',
            cache: true,
            timeout: 5 * 1000,
        });

        this.loadTypeData(pokedex);
        this.loadPokemonData(pokedex);
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

    loadPokemonData(pokedex) {
        pokedex.getPokedexByName('kanto')
            .then(kantoDex => kantoDex.pokemon_entries.map(e => e.pokemon_species.name))
            .then((kantoNames: string[]) => {
                return Promise.all(kantoNames.map(name => pokedex.getPokemonByName(name)))
            })
            .then(allPokemon => {
                const asPokemon: PokemonData[] = allPokemon.map((pokemon, i: number) => ({
                    'name': pokemon.name,
                    'types': pokemon.types.map(t => t.type.name),
                    'index': i,
                }));
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
