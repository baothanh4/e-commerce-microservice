package com.example.userservice.service;

import com.example.userservice.entity.User;
import com.example.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.ArrayList;
import com.example.userservice.entity.Address;
import com.example.userservice.entity.Province;
import com.example.userservice.entity.Ward;
import com.example.userservice.repository.ProvinceRepository;
import com.example.userservice.repository.WardRepository;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final ProvinceRepository provinceRepository;
    private final WardRepository wardRepository;

    @Transactional(readOnly=true)
    public List<User> getAll(){
        return userRepository.findAll();
    }


    @Transactional
    public User save(User user){
        if(userRepository.existsByEmail(user.getEmail())){
            throw new RuntimeException("User with email " + user.getEmail() + " already exists");
        }
        
        List<Address> addresses = user.getAddresses();
        user.setAddresses(new ArrayList<>());
        
        User savedUser = userRepository.save(user);
        
        if (addresses != null && !addresses.isEmpty()) {
            for (Address addr : addresses) {
                addr.setUserId(savedUser.getId());
                if (addr.getProvince() != null && addr.getProvince().getCode() != null) {
                    Province province = provinceRepository.findById(addr.getProvince().getCode())
                            .orElseThrow(() -> new RuntimeException("Tỉnh/Thành phố không tồn tại"));
                    addr.setProvince(province);
                }
                if (addr.getWard() != null && addr.getWard().getCode() != null) {
                    Ward ward = wardRepository.findById(addr.getWard().getCode())
                            .orElseThrow(() -> new RuntimeException("Xã/Phường/Thị trấn không tồn tại"));
                    addr.setWard(ward);
                }
                savedUser.getAddresses().add(addr);
            }
            return userRepository.save(savedUser);
        }
        
        return savedUser;
    }

    @Transactional(readOnly=true)
    public User findById(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new RuntimeException("User with id " + id + " not found"));
    }

    @Transactional
    public User findByEmail(String email) {
        return userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setName(email.split("@")[0]);
            return userRepository.save(newUser);
        });
    }

    @Transactional
    public User updateByEmail(String email, User userDetails) {
        User user = findByEmail(email);
        user.setName(userDetails.getName());
        user.setPhone(userDetails.getPhone());
        user.setDob(userDetails.getDob());
        user.setGender(userDetails.getGender());

        if (userDetails.getAddresses() != null) {
            user.getAddresses().clear();
            for (Address addr : userDetails.getAddresses()) {
                addr.setUserId(user.getId());
                if (addr.getProvince() != null && addr.getProvince().getCode() != null) {
                    Province province = provinceRepository.findById(addr.getProvince().getCode())
                            .orElseThrow(() -> new RuntimeException("Tỉnh/Thành phố không tồn tại"));
                    addr.setProvince(province);
                }
                if (addr.getWard() != null && addr.getWard().getCode() != null) {
                    Ward ward = wardRepository.findById(addr.getWard().getCode())
                            .orElseThrow(() -> new RuntimeException("Xã/Phường/Thị trấn không tồn tại"));
                    addr.setWard(ward);
                }
                user.getAddresses().add(addr);
            }
        }

        return userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public List<Province> getAllProvinces() {
        return provinceRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Ward> getWardsByProvinceCode(String provinceCode) {
        return wardRepository.findByProvinceCode(provinceCode);
    }
}
