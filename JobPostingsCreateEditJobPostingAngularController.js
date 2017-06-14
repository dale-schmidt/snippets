(function () {
            angular.module(APPNAME)
                .controller('jobPostingController', JobPostingController);

            JobPostingController.$inject = ['$baseController', '$scope', '$window', '$sabio', 'jobPostingService', 'jobTagService', 'globalEventService', 'geographyService', 'companyPersonService', 'sweetAlertService', '$sce', '$sanitize'];

            function JobPostingController($baseController, $scope, $window, $sabio, jobPostingService, jobTagService, globalEventService, geographyService, companyPersonService, sweetAlertService, $sce, $sanitize) {
                var vm = this;
                vm.$scope = $scope;
                vm.$window = $window;
                $baseController.merge(vm, $baseController);
                vm.jobPostingService = jobPostingService;
                vm.jobTagService = jobTagService;
                vm.globalEventService = globalEventService;
                vm.geographyService = geographyService;
                vm.companyPersonService = companyPersonService;
                vm.sweetAlertService = sweetAlertService;

                vm.breadcrumbText = "Create";
                vm.posting = {
                    compensationRateId: "0",
                    fullPartId: "0",
                    contractPermanentId: "0",
                    experienceLevelId: "0"
                };
                vm.id = $sabio.id;
                vm.personId = $sabio.personId;
                vm.companies = [];
                vm.jobTags = [];
                vm.countries = [];
                vm.stateProvinces = [];
                vm.selectedCountry = null;
                vm.selectedStateProvince = null;
                vm.selectedJobTags = null;
                vm.selectedCompany = null;
                if (vm.id) {
                    vm.edit = {
                        positionName: false,
                        address: false,
                        compensation: false,
                        compensationRate: false,
                        fullPart: false,
                        contractPermanent: false,
                        experienceLevel: false,
                        description: false,
                        responsibilities: false,
                        requirements: false,
                        contactInformation: false,
                        postingStatus: false,
                        jobTags: false
                    };
                } else {
                    vm.edit = {
                        positionName: true,
                        address: true,
                        compensation: true,
                        description: true,
                        responsibilities: true,
                        requirements: true,
                        contactInformation: true,
                    };
                }

                vm.save = _save;
                vm.cancel = _cancel;
                vm.delete = _delete;
                vm.sanitize = _sanitize;
                vm.countryChange = _countryChange;
                vm.fieldEdit = _fieldEdit;

                // Start up functions
                _getCountries();
                _getJobTags();
                if (vm.id) {
                    vm.breadcrumbText = "Edit";
                    vm.jobPostingService.getById(vm.id, _getByIdSuccess, _getByIdError);
                } else {
                    vm.companyPersonService.getCompanies(vm.personId, _getCompaniesSuccess, _getCompaniesError);
                }

                function _getCompaniesSuccess(data) {
                    vm.$scope.$apply(function () {
                        vm.companies = data.items;
                        vm.selectedCompany = vm.companies[0];
                    })
                }

                function _getCompaniesError(data) {
                    toastr.error("Failed to get companies");
                }

                // Button functions
                function _save() {
                    if (jobPosting.positionName.validity.valid) {
                        vm.posting.companyId = vm.selectedCompany.id;
                        vm.posting.companyName = vm.selectedCompany.name;
                        if (vm.selectedCountry) {
                            vm.posting.countryId = vm.selectedCountry.id;
                        }
                        if (vm.selectedStateProvince) {
                            vm.posting.stateProvinceId = vm.selectedStateProvince.id;
                        }
                        vm.posting.jobTagIds = [];
                        if (vm.selectedJobTags) {
                            for (var i = 0; i < vm.selectedJobTags.length; i++) {
                                vm.posting.jobTagIds.push(vm.selectedJobTags[i].id);
                            }
                        }
                        vm.posting.description = $sanitize(CKEDITOR.instances.description.getData());
                        vm.posting.responsibilities = $sanitize(CKEDITOR.instances.responsibilities.getData());
                        vm.posting.requirements = $sanitize(CKEDITOR.instances.requirements.getData());
                        vm.posting.contactInformation = $sanitize(CKEDITOR.instances.contactInformation.getData());

                        if (vm.id) {
                            vm.jobPostingService.put(vm.id, vm.posting, _putSuccess, _putError);
                        } else {
                            vm.jobPostingService.post(vm.posting, _postSuccess, _postError);
                        }
                    } else {
                        vm.$window.scrollTo(0, 0);
                    }
                }

                function _cancel() {
                    var returnLocation = "/companies/" + vm.selectedCompany.id + "/edit";
                    vm.sweetAlertService.cancel(returnLocation);
                }

                function _delete() {
                    vm.sweetAlertService.delete(vm.id, vm.jobPostingService.delete, _deleteSuccess, _deleteError);
                }

                function _fieldEdit(field) {
                    vm.edit[field] = true;
                }

                // Post functions
                function _postSuccess(data) {
                    vm.$scope.$apply(function () {
                        vm.id = data.item;
                        vm.edit = {
                            positionName: false,
                            address: false,
                            compensation: false,
                            compensationRate: false,
                            fullPart: false,
                            contractPermanent: false,
                            experienceLevel: false,
                            description: false,
                            responsibilities: false,
                            requirements: false,
                            contactInformation: false,
                            postingStatus: false,
                            jobTags: false
                        };
                    })
                    toastr.success("Job posting saved!");
                }

                function _postError(data) {
                    toastr.error("Failed to save posting");
                }

                // Put functions
                function _putSuccess(data) {
                    toastr.success("Job posting saved!");
                    vm.$scope.$apply(function () {
                        vm.edit = {
                            positionName: false,
                            address: false,
                            compensation: false,
                            compensationRate: false,
                            fullPart: false,
                            contractPermanent: false,
                            experienceLevel: false,
                            description: false,
                            responsibilities: false,
                            requirements: false,
                            contactInformation: false,
                            postingStatus: false,
                            jobTags: false
                        };
                    })
                }

                function _putError(data) {
                    toastr.error("Failed to save posting");
                }

                // Get by Id functions
                function _getByIdSuccess(data) {
                    console.log(data);
                    vm.posting = data.item;
                    vm.selectedCompany = {
                        id: data.item.companyId,
                        name: data.item.name
                    }
                    vm.companies.push(vm.selectedCompany);
                    vm.posting.compensationRateId = vm.posting.compensationRateId.toString();
                    vm.posting.fullPartId = vm.posting.fullPartId.toString();
                    vm.posting.contractPermanentId = vm.posting.contractPermanentId.toString();
                    vm.posting.experienceLevelId = vm.posting.experienceLevelId.toString();
                    vm.posting.jobPostingStatusId = vm.posting.jobPostingStatusId.toString();
                    if (vm.posting.countryId) {
                        vm.selectedCountry = vm.countries.find(cntry => cntry.id == vm.posting.countryId);
                        _countryChange();
                    }
                    if (vm.posting.stateProvinceId) {
                        vm.selectedStateProvince = vm.stateProvinces.find(stprvnc => stprvnc.id == vm.posting.stateProvinceId);
                    }
                    vm.selectedJobTags = data.item.jobTags;
                }

                function _getByIdError(data) {
                    toastr.error("Failed to load posting");
                }

                function _sanitize(html_code) {
                    return $sce.trustAsHtml(html_code);
                }

                // Delete functions
                function _deleteSuccess(data) {
                    window.location.href = "/companies/" + vm.selectedCompany.id + "/edit";
                }

                function _deleteError(data) {
                    toastr.error("Failed to delete");
                }

                // Job tags functions
                function _getJobTags() {
                    vm.jobTagService.getAll(_getJobTagsSuccess, _getJobTagsError);
                }

                function _getJobTagsSuccess(data) {
                    vm.jobTags = data.items;
                }

                function _getJobTagsError(data) {
                    toastr.error("Failed to get job tags");
                }

                // Geography functions
                function _getCountries() {
                    vm.geographyService.getAllCountries(_getCountriesSuccess, _getCountriesError);
                }

                function _getCountriesSuccess(data) {
                    vm.countries = data.items;
                }

                function _getCountriesError(data) {
                    toastr.error("Failed to get countries");
                }

                function _countryChange() {
                    vm.geographyService.getStateProvincesByCountryId(vm.selectedCountry.id, _getStateProvincesSuccess, _getStateProvincesError);
                }

                function _getStateProvincesSuccess(data) {
                    vm.stateProvinces = data.items;
                }

                function _getStateProvincesError(data) {
                    toastr.error("Failed to get states/provinces");
                }
            }
        })();