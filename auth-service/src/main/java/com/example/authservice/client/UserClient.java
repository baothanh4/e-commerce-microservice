package com.example.authservice.client;

import com.example.authservice.dto.UserProfileDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "user-service")
public interface UserClient {

    @PostMapping("/users")
    UserProfileDto createUser(@RequestBody UserProfileDto request);

    @GetMapping("/users/email/{email}")
    UserProfileDto getProfileByEmail(@PathVariable("email") String email);

    @PutMapping("/users/email/{email}")
    UserProfileDto updateProfileByEmail(@PathVariable("email") String email, @RequestBody UserProfileDto request);
}
