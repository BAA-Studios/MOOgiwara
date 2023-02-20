import Card from "./card";
import { Vector } from "js-sdsl";

export default class CounterStack {
    counters: Vector<Card> = new Vector<Card>();
}