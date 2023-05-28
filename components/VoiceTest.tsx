import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableHighlight,
} from "react-native";
import Tts from "react-native-tts";
import axios from "axios";

import Voice, {
  SpeechRecognizedEvent,
  SpeechResultsEvent,
  SpeechErrorEvent,
} from "@react-native-voice/voice";

type Props = {};
type State = {
  recognized: string;
  pitch: string;
  error: string;
  end: string;
  started: string;
  results: string[];
  partialResults: string[];
  finalResult: string;
  messages: any[];
  stopped: boolean;
};

class VoiceTest extends Component<Props, State> {
  state = {
    recognized: "",
    pitch: "",
    error: "",
    end: "",
    started: "",
    results: [],
    partialResults: [],
    makingAnswers: [],
    finalResult: "",
    messages: [],
    stopped: false,
  };

  constructor(props: Props) {
    super(props);
    Tts.setDefaultLanguage("es-ES");
    Voice.onSpeechStart = this.onSpeechStart;
    Voice.onSpeechRecognized = this.onSpeechRecognized;
    Voice.onSpeechEnd = this.onSpeechEnd;
    // Voice.onSpeechError = this.onSpeechError;
    Voice.onSpeechResults = this.onSpeechResults;
    Voice.onSpeechPartialResults = this.onSpeechPartialResults;
    // Voice.onSpeechVolumeChanged = this.onSpeechVolumeChanged;
  }
  // componentDidMount() {
  //   this._firstMessage();
  // }

  componentWillUnmount() {
    Voice.destroy().then(Voice.removeAllListeners);
  }

  onSpeechStart = (e: any) => {
    // console.log("onSpeechStart: ", e);
    this.setState({
      started: "√",
    });
  };

  onSpeechRecognized = (e: SpeechRecognizedEvent) => {
    // console.log("onSpeechRecognized: ", e);
    this.setState({
      recognized: "√",
    });
  };

  onSpeechEnd = async (e: any) => {
    // console.log("onSpeechEnd: ", e);
    this.setState({
      end: "√",
    });
  };

  onSpeechError = (e: SpeechErrorEvent) => {
    // console.log("onSpeechError: ", e);
    this.setState({
      error: JSON.stringify(e.error),
    });
  };

  restartVoiceAndConcatLastResults = async (value) => {
    this.state.makingAnswers.push(value);
    // console.log(this.state.makingAnswers);
    await Voice.stop();
    await Voice.start("es-ES");
  };

  onSpeechResults = async (e: SpeechResultsEvent) => {
    console.log("onSpeechResults: ", e.value[0]);
    this.state.makingAnswers.push(e.value[0]);
    console.log(this.state.makingAnswers);

    await Voice.stop();
    await Voice.start("es-ES");
    this.setState({
      results: e.value,
    });

    if (this.state.stopped) {
      this._stopRecognizing();
    }
    // this.restartVoiceAndConcatLastResults(e.value[0]);
  };

  onSpeechPartialResults = (e: SpeechResultsEvent) => {
    // console.log("onSpeechPartialResults: ", e);
    this.setState({
      partialResults: e.value,
    });
  };

  onSpeechVolumeChanged = (e: any) => {
    // console.log("onSpeechVolumeChanged: ", e);
    this.setState({
      pitch: e.value,
    });
  };

  _startRecognizing = async () => {
    this.setState({
      recognized: "",
      pitch: "",
      error: "",
      started: "",
      results: [],
      partialResults: [],
      end: "",
      finalResult: "",
    });

    try {
      await Voice.start("es-ES");
    } catch (e) {
      console.error(e);
    }
  };

  _stopState = async () => {
    this.setState({
      stopped: true,
    });
  };

  _stopRecognizing = async () => {
    // crie um intervalo de 100 centésimos antes de continuar o código para evitar que o reconhecimento de voz seja interrompido

    try {
      // adicione um intervalo de 100 centésimos
      setTimeout(async () => {
        await Voice.stop();
        this._sendMessage();
      }, 500);
    } catch (e) {
      console.error(e);
    }
  };

  _sendMessage = async () => {
    const apiKey = "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";
    const apiUrl = "https://api.openai.com/v1/chat/completions";

    this.setState({
      recognized: "",
      pitch: "",
      error: "",
      started: "",
      results: [],
      partialResults: [],
      end: "",
      finalResult: "",
    });

    if (this.state.makingAnswers.length > 0) {
      console.log(this.state.makingAnswers.join(" "));
      const messages = [
        {
          role: "user",
          content:
            "Prompt: (Interpreta a una argentina llamada Sofía. Le gusta bailar tango, pintar cuadros y ver películas de drama, tanto nacionales como internacionales. No me corrige errores de ortografía o puntuación, pero si nota algún error de español que involucre conjugaciones verbales o errores graves de pronombres y adverbios, ¡me corregirá! Importante: No comentará nada sobre lo que acabo de describir ahora entre paréntesis).",
        },
        ...this.state.messages, // Adicionar mensagens anteriores
        {
          role: "user",
          content: this.state.makingAnswers.join(" "),
        },
      ];

      try {
        console.log("messages", messages);
        const response = await axios.post(
          apiUrl,
          {
            max_tokens: 100,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
            model: "gpt-3.5-turbo-0301",
            messages,
            temperature: 0.5,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
          }
        );
        // console.log("response", response);
        this.state.makingAnswers = [];
        const choices = response.data?.choices?.[0]?.message?.content || false;
        console.log(choices);

        // Atualizar a lista de mensagens no estado
        this.setState((prevState) => ({
          finalResult: choices,
          messages: [
            ...prevState.messages,
            { role: "assistant", content: choices },
          ],
        }));

        Tts.speak(choices.replaceAll("¿", "") || "Desculpe, não entendi", {
          androidParams: {
            KEY_PARAM_PAN: -1,
            KEY_PARAM_VOLUME: 1,
            KEY_PARAM_STREAM: "STREAM_MUSIC",
          },
        });
        // Resto do código...
      } catch (error) {
        console.error(error);
      }
    } else {
      setTimeout(() => this._sendMessage(), 30);
    }
  };

  // _firstMessage = async () => {
  //   const apiKey = "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";
  //   const apiUrl = "https://api.openai.com/v1/chat/completions";

  //   this.setState({
  //     recognized: "",
  //     pitch: "",
  //     error: "",
  //     started: "",
  //     results: [],
  //     partialResults: [],
  //     end: "",
  //     finalResult: "",
  //   });

  //   await axios.post(
  //     apiUrl,
  //     {
  //       max_tokens: 2000,
  //       top_p: 1,
  //       frequency_penalty: 0,
  //       presence_penalty: 0,
  //       model: "gpt-3.5-turbo",
  //       messages: [
  //         {
  //           role: "user",
  //           content:
  //             "(Imagínate que eres una profesora de español llamada Sofía, que vive en Buenos Aires. Sofía ha viajado por toda América Latina y también por España. Le gusta pintar cuadros, bailar tango. Habla de cualquier tema y solo corrige al alumno si es relevante). error. No corrige errores ortográficos.)",
  //         },
  //       ],
  //       temperature: 0.5,
  //     },
  //     {
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${apiKey}`,
  //       },
  //     }
  //   );
  // };

  _cancelRecognizing = async () => {
    try {
      await Voice.cancel();
    } catch (e) {
      console.error(e);
    }
  };

  _destroyRecognizer = async () => {
    try {
      await Voice.destroy();
    } catch (e) {
      console.error(e);
    }
    this.setState({
      recognized: "",
      pitch: "",
      error: "",
      started: "",
      results: [],
      partialResults: [],
      end: "",
      finalResult: "",
    });
  };

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>Welcome to React Native Voice!</Text>
        <Text style={styles.instructions}>
          Hold the button and start speaking.
        </Text>
        <Text
          style={styles.stat}
        >{`Recognized: ${this.state.recognized}`}</Text>
        <Text style={styles.stat}>{`End: ${this.state.end}`}</Text>
        {this.state.results.length ? (
          <Text style={styles.stat}>{this.state.results[0]}</Text>
        ) : (
          <></>
        )}
        {/* <Text style={styles.stat}>{`Started: ${this.state.started}`}</Text>

        <Text style={styles.stat}>{`Pitch: ${this.state.pitch}`}</Text>
        <Text style={styles.stat}>{`Error: ${this.state.error}`}</Text>
        <Text style={styles.stat}>Results</Text>
        {this.state.results.map((result, index) => {
          return (
            <Text key={`result-${index}`} style={styles.stat}>
              {result}
            </Text>
          );
        })}
        <Text style={styles.stat}>Partial Results</Text>
        {this.state.partialResults.map((result, index) => {
          return (
            <Text key={`partial-result-${index}`} style={styles.stat}>
              {result}
            </Text>
          );
        })}
         */}
        <TouchableHighlight
          onPressIn={this._startRecognizing}
          onPressOut={this._stopState}
        >
          <Image
            style={styles.button}
            source={require("../assets/button.png")}
          />
        </TouchableHighlight>
        {/* <TouchableHighlight onPress={this._stopRecognizing}>
          <Text style={styles.action}>Stop Recognizing</Text>
        </TouchableHighlight>
        <TouchableHighlight onPress={this._cancelRecognizing}>
          <Text style={styles.action}>Cancel</Text>
        </TouchableHighlight>
        <TouchableHighlight onPress={this._destroyRecognizer}>
          <Text style={styles.action}>Destroy</Text>
        </TouchableHighlight> */}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  button: {
    width: 100,
    height: 100,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF",
  },
  welcome: {
    fontSize: 20,
    textAlign: "center",
    margin: 10,
  },
  action: {
    textAlign: "center",
    color: "#0000FF",
    marginVertical: 5,
    fontWeight: "bold",
  },
  instructions: {
    textAlign: "center",
    color: "#333333",
    marginBottom: 5,
  },
  stat: {
    textAlign: "center",
    color: "#B0171F",
    marginBottom: 1,
  },
});

export default VoiceTest;
