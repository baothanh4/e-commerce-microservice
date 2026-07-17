package com.example.userservice.controller;


import com.example.userservice.entity.User;
import com.example.userservice.entity.Province;
import com.example.userservice.entity.Ward;
import com.example.userservice.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping
    public List<User> findAll(){
        return userService.getAll();
    }

    @PostMapping
    public User save(@RequestBody User user){
        return userService.save(user);
    }

    @GetMapping("/{id}")
    public User findById(@PathVariable Long id){
        return userService.findById(id);
    }

    @GetMapping("/email/{email}")
    public User findByEmail(@PathVariable String email){
        return userService.findByEmail(email);
    }

    @PutMapping("/email/{email}")
    public User updateByEmail(@PathVariable String email, @RequestBody User userDetails){
        return userService.updateByEmail(email, userDetails);
    }

    @GetMapping("/provinces")
    public List<Province> getAllProvinces() {
        return userService.getAllProvinces();
    }

    @GetMapping("/provinces/{provinceCode}/wards")
    public List<Ward> getWardsByProvinceCode(@PathVariable String provinceCode) {
        return userService.getWardsByProvinceCode(provinceCode);
    }
}
