import m from 'mithril';
import { Pokedex } from 'pokeapi-js-wrapper';
import { INode, PokemonType, ITypeResponse } from './type_to_nodes';
import { Result } from './utils';
import type_to_nodes from './type_to_nodes';

export type PokemonTypeDict = {[key in PokemonType]: INode[]};

interface IPokedex {
    getTypeNodes: () => Result<PokemonTypeDict>;
}

export class ResultPokedex implements IPokedex {
    typeNodesResult: Result<PokemonTypeDict> = {
        status: 'LOADING',
        value: ({} as PokemonTypeDict),
    };

    constructor() {
        const pokedex = new Pokedex({
            protocol: 'https',
            cache: true,
            timeout: 5 * 1000,
        });

        this.loadTypeData(pokedex);
    }

    loadTypeData(pokedex: any) {
        pokedex.getTypesList()
          .then((types: any) => types.results
                .map((result: any) => result.name)
                .filter((name: string) => name !== 'shadow' && name !== 'unknown')
          )
          .then((names: string[]) => {
              return Promise.all(names.map(name => pokedex.getTypeByName(name)));
          })
          .then((types: ITypeResponse[]) => {
              const output: PokemonTypeDict = {} as PokemonTypeDict;
              types.forEach((t: ITypeResponse) => {
                  output[t.name] = type_to_nodes(t);
              })
              this.typeNodesResult.value = output;
              this.typeNodesResult.status = 'SUCCESS';
              m.redraw();
          })
          .catch((e: Error) => {
              this.typeNodesResult.status = 'ERROR';
          });
    }

    getTypeNodes() {
        return this.typeNodesResult;
    }
}
