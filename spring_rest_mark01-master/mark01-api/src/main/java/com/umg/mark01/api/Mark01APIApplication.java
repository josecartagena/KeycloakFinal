package com.umg.mark01.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import springfox.documentation.swagger2.annotations.EnableSwagger2;



@SpringBootApplication
/*@EnableAutoConfiguration
@EnableCaching*/
@EnableSwagger2
/*@EntityScan(basePackages = {"com.umg.mark01.core.entities"})
@EnableJpaRepositories(basePackages = {"com.umg.mark01.api"})*/
@ComponentScan(basePackages = {"com.umg.mark01"})
public class Mark01APIApplication {

    public static void main(String[] args) {

        SpringApplication.run(Mark01APIApplication.class, args);
    }


}
