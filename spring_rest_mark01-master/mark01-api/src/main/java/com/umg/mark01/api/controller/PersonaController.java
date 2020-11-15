package com.umg.mark01.api.controller;


import com.umg.mark01.core.entities.Persona;
import io.swagger.annotations.Api;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.EmitterProcessor;
import reactor.core.publisher.Flux;

import javax.annotation.PostConstruct;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;


@Api(value = "/", description = "REST Persona")
@RestController
@RequestMapping("/persona")
@Slf4j
public class PersonaController {

    private static List<Persona> listaPersonas = new ArrayList<>();


    /* -------------------------------------------------------------------------------------------------------------- */
    /**
     * Notification emitter (emisor de notificaciones)
     */
    private EmitterProcessor<Persona> notificationProcessor;

    /* -------------------------------------------------------------------------------------------------------------- */
    @PostConstruct
    private void createProcessor() {
        notificationProcessor = EmitterProcessor.<Persona>create();
    }

    /* -------------------------------------------------------------------------------------------------------------- */
    @RequestMapping(
            value = "/all",
            method = RequestMethod.GET,
            produces = "application/json")
    public List<Persona> getAll() {
        return listaPersonas;
    }

    /* -------------------------------------------------------------------------------------------------------------- */
    @RequestMapping(
            path = "/create",
            method = RequestMethod.POST)
    public ResponseEntity<?> create(
            @RequestBody Persona entityParam) {
        listaPersonas.add(entityParam);

        // cuando se crea una nueva persona.... notificar esta accion al emisor
        System.out.println("Notificando nueva persona:" + entityParam.getPrimerNombre());
        notificationProcessor.onNext(entityParam);

        return new ResponseEntity<>(entityParam, HttpStatus.OK);
    }

    /* -------------------------------------------------------------------------------------------------------------- */
    @RequestMapping(
            path = "/update",
            method = RequestMethod.PUT)
    public ResponseEntity<?> update(
            @RequestBody Persona entityParam) {

        Persona persona = listaPersonas.get(0);
        persona.setPrimerNombre(entityParam.getSegundoNombre());

        return new ResponseEntity<>(persona, HttpStatus.OK);
    }

    /* -------------------------------------------------------------------------------------------------------------- */

    @RequestMapping(
            value = "/byId",
            method = RequestMethod.GET,
            produces = "application/json")
    public Persona get(@RequestParam Integer id) {

        Persona persona = new Persona();
        persona.setId(id);
        persona.setPrimerNombre("Manuel");
        persona.setSegundoNombre("Mendez");

        return persona;
    }

    /* -------------------------------------------------------------------------------------------------------------- */

    /**
     * Reactive functions (la respuesta hacia el cliente realmente incluye dos respuestas)
     */
    /* -------------------------------------------------------------------------------------------------------------- */

    /**
     * Flujo reactivo que contiene los datos de persona
     *
     * @return
     */
    private Flux<ServerSentEvent<Persona>> getPersonaSSE() {

        // notification processor retorna un FLUX en el cual podemos estar "suscritos" cuando este tenga otro valor ...
        return notificationProcessor
                .log().map(
                        (persona) -> {
                            System.out.println("Sending Persona:" + persona.getId());
                            return ServerSentEvent.<Persona>builder()
                                    .id(UUID.randomUUID().toString())
                                    .event("persona-result")
                                    .data(persona)
                                    .build();
                        }).concatWith(Flux.never());
    }

    /* -------------------------------------------------------------------------------------------------------------- */

    /**
     * Flujo reactivo que posee un "heartbeat" para que la conexión del cliente se mantenga
     *
     * @return
     */
    private Flux<ServerSentEvent<Persona>> getNotificationHeartbeat() {
        return Flux.interval(Duration.ofSeconds(15))
                .map(i -> {
                    System.out.println(String.format("sending heartbeat [%s] ...", i.toString()));
                    return ServerSentEvent.<Persona>builder()
                            .id(String.valueOf(i))
                            .event("heartbeat-result")
                            .data(null)
                            .build();
                });
    }
    /* -------------------------------------------------------------------------------------------------------------- */

    /**
     * Servicio reactivo que retorna la combinación de los dos flujos antes declarados
     * Simplificacion de declaracion GET por "GetMapping"
     *
     * @return
     */
    /* -------------------------------------------------------------------------------------------------------------- */
    @GetMapping(
            value = "/notification/sse"
    )
    public Flux<ServerSentEvent<Persona>> getJobResultNotification() {

        return Flux.merge(getNotificationHeartbeat(), getPersonaSSE());

    }
    /* -------------------------------------------------------------------------------------------------------------- */


}