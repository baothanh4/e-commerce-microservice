package com.example.authservice.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileDto {

    private String name;
    private String email;
    private String phone;
    private String dob; // yyyy-MM-dd
    private String gender; // MALE, FEMALE, OTHER
}
